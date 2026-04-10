import { prisma } from "@/lib/prisma";
import { uploadBuffer } from "@/lib/storage/cloudinary-client";

/**
 * Decodes a base64 data URI, uploads to Cloudinary,
 * creates a FileAsset row in the DB, stamps storageKey on NodeExecution,
 * and returns the public Cloudinary HTTPS URL.
 */
export async function saveOutputToStorage(
  nodeExecutionId: string,
  dataUri: string,
  runId: string,
  nodeId: string,
): Promise<string> {
  // 1. Parse the data URI — "data:image/jpeg;base64,<data>"
  const match = dataUri.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("saveOutputToStorage: invalid data URI format");
  }
  const mimeType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");

  // 2. Upload to Cloudinary — returns a real HTTPS URL
  const cdnUrl = await uploadBuffer(buffer, mimeType, runId, nodeId);

  // 3. Record the FileAsset in Postgres
  await prisma.fileAsset.create({
    data: {
      nodeExecutionId,
      s3Key: cdnUrl,        // storing Cloudinary URL here — no S3 key needed
      cdnUrl,
      mimeType,
      sizeBytes: buffer.byteLength,
    },
  });

  // 4. Stamp storageKey on the NodeExecution
  await prisma.nodeExecution.update({
    where: { id: nodeExecutionId },
    data: { storageKey: cdnUrl },
  });

  return cdnUrl;
}