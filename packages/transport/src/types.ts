export type ProviderName = "anthropic" | "openai" | "gemini" | "qwen" | "local";

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface UsageAccounting {
  track: (usage: TokenUsage) => void;
}

export interface StreamChunk {
  kind: "answer" | "reasoning";
  id: string; // non-empty stable id for TUI ordering
  text: string;
  done?: boolean;
}

export interface ChatRequest {
  model: string;
  system?: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  temperature?: number;
  maxTokens?: number;
  seed?: number;
}

export interface ChatResponse {
  text: string;
  usage?: TokenUsage;
}

export interface StreamingChat {
  stream(): AsyncGenerator<StreamChunk, ChatResponse, void>;
}

export interface ProviderAdapter {
  name: ProviderName;
  chat(req: ChatRequest, usage?: UsageAccounting): Promise<ChatResponse>;
  chatStream(req: ChatRequest, usage?: UsageAccounting): Promise<StreamingChat>;
}
