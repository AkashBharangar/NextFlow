import { HuggingFaceAdapter } from "./huggingface";
import { ReplicateAdapter } from "./replicate";
import { AdapterRegistry } from "./registry";

const registry = new AdapterRegistry();

registry.register(new HuggingFaceAdapter());
registry.register(new ReplicateAdapter());

export { registry };
export type { AIModelAdapter, ModelInput, ModelOutput, SubmitResult } from "./types";