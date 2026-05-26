import type { AIProvider, Message } from "@/types";

interface StreamOptions {
  provider: AIProvider;
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseUrl?: string;
  onChunk: (chunk: string) => void;
  onDone: (usage: { inputTokens: number; outputTokens: number }) => void;
  onError: (error: Error) => void;
}

// OpenAI-compatible streaming (used by OpenAI, Groq, DeepSeek, OpenRouter, Ollama)
async function streamOpenAICompatible(opts: StreamOptions) {
  const baseUrl = opts.baseUrl ?? "https://api.openai.com/v1";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (opts.apiKey) {
    headers["Authorization"] = `Bearer ${opts.apiKey}`;
  }

  // OpenRouter requires site info
  if (opts.provider === "openrouter") {
    headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    headers["X-Title"] = process.env.NEXT_PUBLIC_APP_NAME ?? "AISpace";
  }

  const body = {
    model: opts.model,
    messages: opts.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 2048,
    stream: true,
    stream_options: { include_usage: true },
  };

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${opts.provider} API error ${res.status}: ${err}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let usage = { inputTokens: 0, outputTokens: 0 };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === "[DONE]") continue;

      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) opts.onChunk(delta);

        if (json.usage) {
          usage = {
            inputTokens: json.usage.prompt_tokens ?? 0,
            outputTokens: json.usage.completion_tokens ?? 0,
          };
        }
      } catch {
        // skip malformed SSE lines
      }
    }
  }

  opts.onDone(usage);
}

// Gemini streaming via REST
async function streamGemini(opts: StreamOptions) {
  const apiKey = opts.apiKey;
  if (!apiKey) throw new Error("Gemini API key is required");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:streamGenerateContent?key=${apiKey}&alt=sse`;

  const systemMsg = opts.messages.find((m) => m.role === "system");
  const conversationMsgs = opts.messages.filter((m) => m.role !== "system");

  const body: Record<string, unknown> = {
    contents: conversationMsgs.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxTokens ?? 2048,
    },
  };

  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let inputTokens = 0;
  let outputTokens = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

    for (const line of lines) {
      try {
        const json = JSON.parse(line.slice(6));
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) opts.onChunk(text);

        if (json.usageMetadata) {
          inputTokens = json.usageMetadata.promptTokenCount ?? 0;
          outputTokens = json.usageMetadata.candidatesTokenCount ?? 0;
        }
      } catch {
        // skip
      }
    }
  }

  opts.onDone({ inputTokens, outputTokens });
}

// Anthropic streaming
async function streamAnthropic(opts: StreamOptions) {
  const apiKey = opts.apiKey;
  if (!apiKey) throw new Error("Anthropic API key is required");

  const systemMsg = opts.messages.find((m) => m.role === "system")?.content;
  const messages = opts.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const body: Record<string, unknown> = {
    model: opts.model,
    max_tokens: opts.maxTokens ?? 2048,
    messages,
    stream: true,
  };

  if (systemMsg) body.system = systemMsg;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let usage = { inputTokens: 0, outputTokens: 0 };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

    for (const line of lines) {
      try {
        const json = JSON.parse(line.slice(6));
        if (json.type === "content_block_delta") {
          opts.onChunk(json.delta?.text ?? "");
        }
        if (json.type === "message_delta" && json.usage) {
          usage.outputTokens = json.usage.output_tokens ?? 0;
        }
        if (json.type === "message_start" && json.message?.usage) {
          usage.inputTokens = json.message.usage.input_tokens ?? 0;
        }
      } catch {
        // skip
      }
    }
  }

  opts.onDone(usage);
}

export async function streamAIResponse(opts: StreamOptions) {
  try {
    switch (opts.provider) {
      case "anthropic":
        return await streamAnthropic(opts);
      case "gemini":
        return await streamGemini(opts);
      default:
        return await streamOpenAICompatible(opts);
    }
  } catch (err) {
    opts.onError(err instanceof Error ? err : new Error(String(err)));
  }
}
