const LOCAL_LLM_ENABLED = process.env.LOCAL_LLM_ENABLED === "true";
const LOCAL_LLM_BASE_URL = process.env.LOCAL_LLM_BASE_URL || "http://127.0.0.1:11434";
const LOCAL_LLM_MODEL = process.env.LOCAL_LLM_MODEL || "qwen2.5:3b-instruct";

export function getLocalLlmConfig() {
  return {
    enabled: LOCAL_LLM_ENABLED,
    baseUrl: LOCAL_LLM_BASE_URL,
    model: LOCAL_LLM_MODEL,
  };
}

export async function generateLocalJson<T>({
  prompt,
  maxTokens = 220,
}: {
  prompt: string;
  maxTokens?: number;
}) {
  const config = getLocalLlmConfig();

  if (!config.enabled) {
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
    model: config.model,
    data: JSON.parse(payload.response) as T,
  };
}
