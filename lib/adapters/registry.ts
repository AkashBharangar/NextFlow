import type { AIModelAdapter } from "./types";

export class AdapterRegistry {
  private adapters = new Map<string, AIModelAdapter>();

  register(adapter: AIModelAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  get(provider: string): AIModelAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(
        `No adapter registered for provider: "${provider}". ` +
        `Registered providers: ${[...this.adapters.keys()].join(", ")}`,
      );
    }
    return adapter;
  }

  has(provider: string): boolean {
    return this.adapters.has(provider);
  }

  list(): string[] {
    return [...this.adapters.keys()];
  }
}