import type { AIModelAdapter, ModelInput, ModelOutput, SubmitResult } from "./types";

const HF_SDXL_URL =
  "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";

export class HuggingFaceAdapter implements AIModelAdapter {
  provider = "huggingface";

  async submit(input: ModelInput): Promise<SubmitResult> {
    const token = process.env.HUGGINGFACE_API_TOKEN?.trim();
    if (!token) throw new Error("HUGGINGFACE_API_TOKEN is not set");

    const prompt =
      typeof input.params.prompt === "string"
        ? input.params.prompt
        : String(input.params.prompt ?? "");
    if (!prompt.trim()) {
      throw new Error("HuggingFaceAdapter: prompt must be a non-empty string");
    }

    // Use model URL from input if provided, otherwise fall back to SDXL default
    const url =
      typeof input.params.modelUrl === "string"
        ? input.params.modelUrl
        : HF_SDXL_URL;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `HuggingFace inference failed (${res.status} ${res.statusText}): ${text}`,
      );
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return {
      type: "immediate",
      output: this.formatOutput(base64),
    };
  }

  // Hugging Face inference API is synchronous — no polling needed
  async getStatus(_externalId: string): Promise<"running" | "succeeded" | "failed"> {
    return "succeeded";
  }

  formatOutput(raw: unknown): ModelOutput {
    const base64 = typeof raw === "string" ? raw : "";
    return {
      dataUri: `data:image/jpeg;base64,${base64}`,
    };
  }
}