import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
  } from "@aws-sdk/client-s3";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  
  function getR2Client(): S3Client {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  
    if (!accountId?.trim()) throw new Error("R2_ACCOUNT_ID is not set");
    if (!accessKeyId?.trim()) throw new Error("R2_ACCESS_KEY_ID is not set");
    if (!secretAccessKey?.trim()) throw new Error("R2_SECRET_ACCESS_KEY is not set");
  
    return new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  
  export async function uploadBuffer(
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    const bucket = process.env.R2_BUCKET;
    if (!bucket?.trim()) throw new Error("R2_BUCKET is not set");
  
    const client = getR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
  }
  
  export async function getSignedOutputUrl(
    key: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    const bucket = process.env.R2_BUCKET;
    if (!bucket?.trim()) throw new Error("R2_BUCKET is not set");
  
    const client = getR2Client();
    return getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }
  
  export async function deleteObject(key: string): Promise<void> {
    const bucket = process.env.R2_BUCKET;
    if (!bucket?.trim()) throw new Error("R2_BUCKET is not set");
  
    const client = getR2Client();
    await client.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: key }),
    );
  }
  
  export function buildCdnUrl(key: string): string {
    const base = process.env.CDN_BASE_URL;
    if (!base?.trim()) throw new Error("CDN_BASE_URL is not set");
    return `${base}/${key}`;
  }