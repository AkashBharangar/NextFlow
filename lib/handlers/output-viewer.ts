export async function outputViewerHandler(
  _config: Record<string, unknown>,
  inputs: Record<string, unknown>,
  _context?: { nodeExecutionId?: string; runId?: string; nodeId?: string },
): Promise<Record<string, unknown>> {
  return { ...inputs };
}
