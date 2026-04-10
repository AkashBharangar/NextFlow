import { imageGenHandler } from "./image-gen";
import { outputViewerHandler } from "./output-viewer";
import { promptInputHandler } from "./prompt-input";

export const nodeHandlers: Record<
  string,
  (
    config: Record<string, unknown>,
    inputs: Record<string, unknown>,
    context?: { nodeExecutionId?: string; runId?: string; nodeId?: string },
  ) => Promise<Record<string, unknown>>
> = {
  "prompt-input": promptInputHandler,
  "output-viewer": outputViewerHandler,
  "image-gen": imageGenHandler,
};
