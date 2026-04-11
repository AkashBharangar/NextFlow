export type ModelInput = {
  provider: string;
  model: string;
  params: Record<string, unknown>;
};

export type ModelOutput = {
  dataUri?: string;   // base64 data URI — populated for immediate results
  cdnUrl?: string;    // populated after storage upload
  metadata?: Record<string, unknown>;
};

export type SubmitResult =
  | { type: "immediate"; output: ModelOutput }
  | { type: "async"; externalId: string };

export interface AIModelAdapter {
  provider: string;
  submit(input: ModelInput): Promise<SubmitResult>;
  getStatus(externalId: string): Promise<"running" | "succeeded" | "failed">;
  formatOutput(raw: unknown): ModelOutput;
}
