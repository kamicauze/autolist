export type AiProvider = "openai" | "local";

const AI_PROVIDER = (process.env.AI_PROVIDER || "").trim().toLowerCase();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_REQUEST_TIMEOUT_MS = Number(process.env.OPENAI_REQUEST_TIMEOUT_MS || "8000");
const OPENAI_WEB_RESEARCH_MODEL =
  process.env.OPENAI_VEHICLE_RESEARCH_MODEL || process.env.OPENAI_COMPLEX_MODEL || "gpt-5.5";

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

export type AiWebSource = {
  title: string;
  url: string;
};

type ResponsesOutputItem = {
  type?: string;
  action?: {
    sources?: Array<{ title?: string; url?: string }>;
  };
  content?: Array<{
    type?: string;
    text?: string;
    annotations?: Array<{ type?: string; title?: string; url?: string }>;
  }>;
};

function safeWebSource(title: unknown, value: unknown): AiWebSource | null {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    return {
      title: typeof title === "string" && title.trim() ? title.trim() : url.hostname,
      url: url.toString(),
    };
  } catch {
    return null;
  }
}

function parseWebResponseSources(output: ResponsesOutputItem[]) {
  const sources = output.flatMap((item) => [
    ...(item.action?.sources || []).map((source) => safeWebSource(source.title, source.url)),
    ...(item.content || []).flatMap((content) =>
      (content.annotations || []).map((annotation) =>
        annotation.type === "url_citation"
          ? safeWebSource(annotation.title, annotation.url)
          : null
      )
    ),
  ]);
  const unique = new Map<string, AiWebSource>();

  for (const source of sources) {
    if (source && !unique.has(source.url)) unique.set(source.url, source);
  }

  return Array.from(unique.values()).slice(0, 10);
}

export async function generateOpenAiWebJson<T>({
  prompt,
  schema,
  maxTokens = 2200,
  timeoutMs,
}: {
  prompt: string;
  schema: Record<string, unknown>;
  maxTokens?: number;
  timeoutMs?: number;
}) {
  const config = getAiProviderConfig();
  if (!config.enabled || config.provider !== "openai") return null;

  const controller = new AbortController();
  const requestTimeout = resolveTimeoutMs(timeoutMs, 30000);
  const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

  try {
    const response = await fetch(`${config.baseUrl}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_WEB_RESEARCH_MODEL,
        reasoning: { effort: "low" },
        tools: [{ type: "web_search", search_context_size: "low" }],
        tool_choice: "auto",
        include: ["web_search_call.action.sources"],
        max_output_tokens: maxTokens,
        input: [
          {
            role: "system",
            content:
              "Research vehicle model years using reliable public web sources. Return only the requested JSON. Treat seller listing facts separately from typical model-year information.",
          },
          { role: "user", content: prompt },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "vehicle_comparison_research",
            strict: true,
            schema,
          },
        },
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`OpenAI web research failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as { output?: ResponsesOutputItem[] };
    const output = Array.isArray(payload.output) ? payload.output : [];
    const text = output
      .flatMap((item) => item.content || [])
      .find((content) => content.type === "output_text" && content.text)?.text;

    if (!text) throw new Error("OpenAI web research returned no comparison content.");

    return {
      provider: "openai" as const,
      model: OPENAI_WEB_RESEARCH_MODEL,
      data: JSON.parse(text) as T,
      sources: parseWebResponseSources(output),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`OpenAI web research timed out after ${requestTimeout}ms.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
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
