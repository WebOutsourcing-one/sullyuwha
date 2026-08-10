import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import type { AssetKey } from "@/domain/value-objects/AssetKey";
import type { AssetResolver } from "./R2AssetResolver";

export interface S3Config {
  endpoint?: string;
  region: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  /**
   * 버킷 안에서 이 프로젝트가 쓰는 루트 경로(앞뒤 슬래시 없이). 예) `sullyuwha`
   * 버킷을 여러 프로젝트가 공유할 때 키 충돌을 막는다. 없으면 버킷 루트를 쓴다.
   */
  keyPrefix?: string | null;
  /** 공개 읽기 URL의 베이스. `keyPrefix`가 있으면 그 경로까지 포함해야 한다. */
  publicUrl: string;
}

export interface UploadResult {
  key: string;
  url: string;
}

export class S3AssetResolver implements AssetResolver {
  private readonly client: S3Client;

  constructor(private readonly config: S3Config) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
      forcePathStyle: !!config.endpoint,
    });
  }

  get isConfigured(): boolean {
    return true;
  }

  /**
   * 논리 키를 실제 버킷 키로 바꾼다. (`products/x` → `sullyuwha/products/x`)
   *
   * 이 변환을 리졸버 안에 가둬 두는 이유 — 호출부(업로드 라우트·리포지토리)가
   * 접두사를 직접 붙이면 붙이는 곳과 빠뜨리는 곳이 생기고, 그러면 쓰기와 읽기가
   * 서로 다른 경로를 보게 된다. 바깥에서는 접두사가 없는 논리 키만 다룬다.
   */
  private storageKey(key: string): string {
    return this.config.keyPrefix ? `${this.config.keyPrefix}/${key}` : key;
  }

  resolve(key: AssetKey, ext: string = "jpg"): string | null {
    // publicUrl이 이미 접두사까지 포함한다 — 여기서 또 붙이면 경로가 두 번 들어간다.
    return `${this.config.publicUrl}/${key.value}.${ext}`;
  }

  async upload(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<UploadResult> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.config.bucket,
        Key: this.storageKey(key),
        Body: buffer,
        ContentType: contentType,
      },
    });

    await upload.done();

    // 돌려주는 key는 논리 키다. 저장 측(DB)이 접두사를 모르게 해야
    // 나중에 버킷이나 접두사를 바꿔도 데이터를 손대지 않는다.
    return {
      key,
      url: `${this.config.publicUrl}/${key}`,
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: this.storageKey(key),
      }),
    );
  }

  async list(prefix: string): Promise<string[]> {
    const storagePrefix = this.storageKey(prefix);
    const result = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.config.bucket,
        Prefix: storagePrefix,
      }),
    );

    // 들어올 때와 같은 논리 키로 되돌려준다 — 호출부는 접두사를 모른다.
    const strip = this.config.keyPrefix ? `${this.config.keyPrefix}/` : "";
    return (result.Contents ?? [])
      .map((obj) => obj.Key ?? "")
      .filter(Boolean)
      .map((key) => (strip && key.startsWith(strip) ? key.slice(strip.length) : key));
  }

  getPresignedUrl(key: string): string {
    return `${this.config.publicUrl}/${key}`;
  }
}
