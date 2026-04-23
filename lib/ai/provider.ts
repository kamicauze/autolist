export type AiProvider = "openai" | "local";

const AI_PROVIDER = (process.env.AI_PROVIDER || "").trim().toLowerCase();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_REQUEST_TIMEOUT_MS = Number(process.env.OPENAI_REQUEST_TIMEOUT_MS || "8000");

const LOCAL_LLM_ENABLED = process.env.LOCAL_LLM_ENABLED === "true";
const LOCAL_LLM_BASE_URL = process.env.LOCAL_LLM_BASE_URL || "http://127.0.0.1:11434";
const LOCAL_LLM_MODEL = process.env.LOCAL_LLM_MODEL || "qwen2.5:3b-instruct";

function resolveTimeoutMs(value: number | undefined, fallback: number) {
  return Number.isFinite(value) && value && value > 0 ? value : fallback;
}

function resolveProvider(): AiProvider | null {
  if (AI_PROVIDER === "openai" && OPENAI_API_KEY) {
    return "openai";
  }

  if (AI_PROVIDER === "local" && LOCAL_LLM_ENABLED) {
    return "local";
  }

  if (OPENAI_API_KEY) {
    return "openai";
  }

  if (LOCAL_LLM_ENABLED) {
    return "local";
  }

  return null;
}

export function getAiProviderConfig() {
  const provider = resolveProvider();

  if (!provider) {
    return {
      enabled: false,
      provider: null,
      model: null,
    } as const;
  }

  if (provider === "openai") {
    return {
      enabled: true,
      provider,
      model: OPENAI_MODEL,
      apiKey: OPENAI_API_KEY,
      baseUrl: OPENAI_BASE_URL,
    } as const;
  }

  return {
    enabled: true,
    provider,
    model: LOCAL_LLM_MODEL,
    baseUrl: LOCAL_LLM_BASE_URL,
  } as const;
}

async function generateOpenAiJson<T>({
  prompt,
  maxTokens,
  model,
  timeoutMs,
}: {
  prompt: string;
  maxTokens: number;
  model?: string;
  timeoutMs?: number;
}) {
  const config = getAiProviderConfig();
  if (!config.enabled || config.provider !== "openai") {
    return null;
  }

  const controller = new AbortController();
  const requestTimeout = resolveTimeoutMs(timeoutMs, resolveTimeoutMs(OPENAI_REQUEST_TIMEOUT_MS, 8000));
  const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: model || config.model,
        temperature: 0.1,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Return valid JSON only. Do not wrap the JSON in markdown.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI returned an empty response.");
    }

    return {
      provider: "openai" as const,
      model: model || config.model,
      data: JSON.parse(content) as T,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`OpenAI request timed out after ${requestTimeout}ms.`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function generateLocalJsonInternal<T>({
  prompt,
  maxTokens,
}: {
  prompt: string;
  maxTokens: number;
}) {
  const config = getAiProviderConfig();

  if (!config.enabled || config.provider !== "local") {
    return null;
  }

  const response = await fetch(`${config.baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      prompt,
      format: "json",
      stream: false,
      options: {
        temperature: 0.1,
        num_predict: maxTokens,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Local LLM request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { response?: string };
  if (!payload.response) {
    throw new Error("Local LLM returned an empty response.");
  }

  return {
    provider: "local" as const,
    model: config.model,
    data: JSON.parse(payload.response) as T,
  };
}

export async function generateAiJson<T>({
  prompt,
  maxTokens = 220,
  model,
  timeoutMs,
}: {
  prompt: string;
  maxTokens?: number;
  model?: string;
  timeoutMs?: number;
}) {
  const config = getAiProviderConfig();

  if (!config.enabled) {
    return null;
  }

  if (config.provider === "openai") {
    return generateOpenAiJson<T>({ prompt, maxTokens, model, timeoutMs });
  }

  return generateLocalJsonInternal<T>({ prompt, maxTokens });
}
