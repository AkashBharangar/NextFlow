/**
 * Server-side allowlist of permitted provider + model combinations.
 * This is checked in the worker before any adapter call so that
 * a user cannot abuse the system by editing graphJson directly
 * to call unintended or expensive models.
 */

export type AllowedModel = {
  provider: string;
  modelId: string;
};

const ALLOWED_MODELS: AllowedModel[] = [
  { provider: "huggingface", modelId: "black-forest-labs/FLUX.1-schnell" },
  { provider: "huggingface", modelId: "black-forest-labs/FLUX.1-dev" },
  { provider: "replicate",   modelId: "black-forest-labs/flux-schnell" },
  { provider: "replicate",   modelId: "stability-ai/sdxl" },
];

/**
 * Returns true if the provider + model combination is permitted.
 */
export function isAllowedModel(provider: string, model: string): boolean {
  return ALLOWED_MODELS.some(
    (m) => m.provider === provider && m.modelId === model,
  );
}

/**
 * Throws a non-retryable error if the combination is not on the allowlist.
 * The error message starts with "Invalid input:" so classifyError()
 * maps it to INVALID_INPUT and does not waste retries.
 */
export function assertAllowedModel(provider: string, model: string): void {
  if (!isAllowedModel(provider, model)) {
    throw new Error(
      `Invalid input: provider "${provider}" with model "${model}" is not permitted`,
    );
  }
}
