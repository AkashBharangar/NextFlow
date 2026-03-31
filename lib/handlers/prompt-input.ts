export async function promptInputHandler(
  config: Record<string, unknown>,
  _inputs: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const value =
    typeof config.value === "string" ? config.value : String(config.value ?? "");
  return { prompt: value };
}
