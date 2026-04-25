import { registry } from "@/lib/adapters";
import { assertAllowedModel } from "@/lib/services/model-allowlist";
import { isStorageConfigured } from "@/lib/storage/cloudinary-client";
import { saveOutputToStorage } from "@/lib/storage/storage-service";

export async function imageGenHandler(
  config: Record<string, unknown>,
  inputs: Record<string, unknown>,
  context?: { nodeExecutionId?: string; runId?: string; nodeId?: string },
): Promise<Record<string, unknown>> {
  // Provider and model can be set per-node in config (Stage 2 multi-provider).
  // Default to huggingface so existing workflows keep working unchanged.
  const provider =
    typeof config.provider === "string" && config.provider.trim()
      ? config.provider.trim()
      : "huggingface";

  const model =
    typeof config.model === "string" && config.model.trim()
      ? config.model.trim()
      : "black-forest-labs/FLUX.1-schnell";

  assertAllowedModel(provider, model);

  const adapter = registry.get(provider);

  const result = await adapter.submit({
    provider,
    model,
    params: { ...inputs, ...config },
  });

  if (result.type === "async") {
    if (
      !context?.nodeExecutionId ||
      !context?.runId ||
      !context?.nodeId
    ) {
      throw new Error(
        "imageGenHandler: async result requires full execution context",
      );
    }

    const { getPollingQueue } = await import("@/lib/queues/polling-queue");
    await getPollingQueue().add(
      "poll",
      {
        runId: context.runId,
        nodeId: context.nodeId,
        nodeExecutionId: context.nodeExecutionId,
        provider,
        model,
        externalId: result.externalId,
        pollAttempt: 1,
        maxPollAttempts: 60,
      },
      {
        delay: 5000,
        attempts: 1,
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 100 },
      },
    );

    // Mark the node as polling so the frontend shows the right status
    await import("@/lib/prisma").then(({ prisma }) =>
      prisma.nodeExecution.update({
        where: { id: context.nodeExecutionId },
        data: { status: "polling", externalJobId: result.externalId },
      }),
    );

    // Return a sentinel — the polling worker will write the real output later
    return { image_url: null, status: "polling", externalId: result.externalId };
  }

  const { dataUri } = result.output;
  if (!dataUri) {
    throw new Error("imageGenHandler: adapter returned no dataUri");
  }

  // Upload to Cloudinary if configured and execution context is available
  if (
    isStorageConfigured() &&
    context?.nodeExecutionId &&
    context?.runId &&
    context?.nodeId
  ) {
    const cdnUrl = await saveOutputToStorage(
      context.nodeExecutionId,
      dataUri,
      context.runId,
      context.nodeId,
    );
    return { image_url: cdnUrl };
  }

  // Fallback: return base64 for local dev without Cloudinary credentials
  return { image_url: dataUri };
}