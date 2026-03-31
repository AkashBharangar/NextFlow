export async function outputViewerHandler(
  _config: Record<string, unknown>,
  inputs: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return { ...inputs };
}
