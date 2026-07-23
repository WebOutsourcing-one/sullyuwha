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

  resolve(key: AssetKey, ext: string = "jpg"): string | null {
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
        Key: key,
        Body: buffer,
        ContentType: contentType,
      },
    });

    await upload.done();

    return {
      key,
      url: `${this.config.publicUrl}/${key}`,
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      }),
    );
  }

  async list(prefix: string): Promise<string[]> {
    const result = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.config.bucket,
        Prefix: prefix,
      }),
    );

    return (result.Contents ?? []).map((obj) => obj.Key ?? "").filter(Boolean);
  }

  getPresignedUrl(key: string): string {
    return `${this.config.publicUrl}/${key}`;
  }
}
