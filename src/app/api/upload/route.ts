import { NextRequest, NextResponse } from "next/server";
import { loadEnv } from "@/infrastructure/config/env";
import { S3AssetResolver } from "@/infrastructure/assets/S3AssetResolver";

export async function POST(request: NextRequest) {
  const env = loadEnv();
  if (!env.s3AccessKey) {
    return NextResponse.json({ error: "S3 not configured" }, { status: 400 });
  }

  const resolver = new S3AssetResolver({
    endpoint: env.s3Endpoint ?? undefined,
    region: env.s3Region,
    accessKey: env.s3AccessKey,
    secretKey: env.s3SecretKey,
    bucket: env.s3Bucket,
    publicUrl: env.s3PublicUrl ?? `https://${env.s3Bucket}.s3.${env.s3Region}.amazonaws.com`,
  });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const prefix = (formData.get("prefix") as string) ?? "uploads";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await resolver.upload(buffer, key, file.type);

  return NextResponse.json(result);
}
