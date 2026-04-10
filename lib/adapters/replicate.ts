import type {
    AIModelAdapter,
    ModelInput,
    ModelOutput,
    SubmitResult,
  } from "./types";
  
  const REPLICATE_API_BASE = "https://api.replicate.com/v1";
  
  export class ReplicateAdapter implements AIModelAdapter {
    provider = "replicate";
  
    async submit(input: ModelInput): Promise<SubmitResult> {
      const token = process.env.REPLICATE_API_TOKEN?.trim();
      if (!token) throw new Error("REPLICATE_API_TOKEN is not set");
  
      const prompt =
        typeof input.params.prompt === "string"
          ? input.params.prompt
          : String(input.params.prompt ?? "");
      if (!prompt.trim()) {
        throw new Error("ReplicateAdapter: prompt must be a non-empty string");
      }
  
      const res = await fetch(`${REPLICATE_API_BASE}/models/${input.model}/predictions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait=5",
        },
        body: JSON.stringify({
          input: { prompt },
        }),
      });
  
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Replicate submission failed (${res.status} ${res.statusText}): ${text}`,
        );
      }
  
      const data = (await res.json()) as {
        id: string;
        status: string;
        output?: string[];
        urls?: { get: string };
      };
  
      // Replicate returns immediately if the model is warm (Prefer: wait=5)
      if (data.status === "succeeded" && data.output?.length) {
        return {
          type: "immediate",
          output: this.formatOutput(data.output),
        };
      }
  
      // Otherwise it is async — return the prediction id for polling
      return {
        type: "async",
        externalId: data.id,
      };
    }
  
    async getStatus(
      externalId: string,
    ): Promise<"running" | "succeeded" | "failed"> {
      const token = process.env.REPLICATE_API_TOKEN?.trim();
      if (!token) throw new Error("REPLICATE_API_TOKEN is not set");
  
      const res = await fetch(
        `${REPLICATE_API_BASE}/predictions/${externalId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
  
      if (!res.ok) {
        throw new Error(
          `Replicate status check failed (${res.status} ${res.statusText})`,
        );
      }
  
      const data = (await res.json()) as {
        status: string;
        output?: string[];
        error?: string;
      };
  
      if (data.status === "succeeded") return "succeeded";
      if (data.status === "failed" || data.status === "canceled") return "failed";
      return "running";
    }
  
    async getOutput(externalId: string): Promise<ModelOutput> {
      const token = process.env.REPLICATE_API_TOKEN?.trim();
      if (!token) throw new Error("REPLICATE_API_TOKEN is not set");
  
      const res = await fetch(
        `${REPLICATE_API_BASE}/predictions/${externalId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
  
      if (!res.ok) {
        throw new Error(
          `Replicate output fetch failed (${res.status} ${res.statusText})`,
        );
      }
  
      const data = (await res.json()) as { output?: string[]; error?: string };
  
      if (data.error) {
        throw new Error(`Replicate prediction failed: ${data.error}`);
      }
  
      return this.formatOutput(data.output ?? []);
    }
  
    formatOutput(raw: unknown): ModelOutput {
      const urls = Array.isArray(raw) ? raw : [];
      const firstUrl = typeof urls[0] === "string" ? urls[0] : undefined;
      return {
        cdnUrl: firstUrl,
        metadata: { outputUrls: urls },
      };
    }
  }
  