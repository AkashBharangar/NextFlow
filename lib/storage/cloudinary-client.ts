import { v2 as cloudinary } from "cloudinary";

function configure() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName) throw new Error("CLOUDINARY_CLOUD_NAME is not set");
  if (!apiKey) throw new Error("CLOUDINARY_API_KEY is not set");
  if (!apiSecret) throw new Error("CLOUDINARY_API_SECRET is not set");

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
}

/**
 * Uploads a Buffer to Cloudinary and returns the secure HTTPS URL.
 * folder pattern: nextflow/outputs/{runId}/{nodeId}
 */
export async function uploadBuffer(
  buffer: Buffer,
  mimeType: string,
  runId: string,
  nodeId: string,
): Promise<string> {
  configure();

  const resourceType = mimeType.startsWith("video/") ? "video" : "image";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `nextflow/outputs/${runId}/${nodeId}`,
        resource_type: resourceType,
        format: mimeType.split("/")[1] ?? "jpg",
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload returned no result"));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

export function isStorageConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
    process.env.CLOUDINARY_API_KEY?.trim() &&
    process.env.CLOUDINARY_API_SECRET?.trim()
  );
}
