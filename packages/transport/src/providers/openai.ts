import type {
  ChatRequest,
  ChatResponse,
  ProviderAdapter,
  StreamingChat,
  StreamChunk,
  UsageAccounting,
} from "../types.js";

function stableId(req: ChatRequest, seq: number): string {
  const seed = (req.seed ?? 0) >>> 0;
  return `openai:${seed}:${seq}`;
}

export const name: ProviderAdapter["name"] = "openai";

export async function chat(
  req: ChatRequest,
  usage?: UsageAccounting
): Promise<ChatResponse> {
  const text = `[openai:${req.model}] ${req.messages.at(-1)?.content ?? ""}`;
  usage?.track?.({ prompt: 1, completion: 1, total: 2 });
  return { text, usage: { prompt: 1, completion: 1, total: 2 } };
}

export async function chatStream(
  req: ChatRequest,
  usage?: UsageAccounting
): Promise<StreamingChat> {
  let seq = 0;
  async function* stream(): AsyncGenerator<StreamChunk, ChatResponse, void> {
    const content = req.messages.at(-1)?.content ?? "";
    const parts = content.split(/(\s+)/).filter(Boolean);
    for (const p of parts) {
      yield { kind: "answer", id: stableId(req, ++seq), text: p };
    }
    const text = `[openai:${req.model}] ${content}`;
    const usageStats = { prompt: 1, completion: 1, total: 2 };
    usage?.track?.(usageStats);
    return { text, usage: usageStats };
  }
  return { stream };
}

