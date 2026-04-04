export type AiProviderName = "dashscope" | "deepseek";
export type AiRequestPurpose = "chat" | "cv-text" | "cv-vision";

export interface CompatibleMessage {
  role: string;
  content: unknown;
  name?: string;
}

export interface ProviderAttempt {
  provider: AiProviderName;
  label: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface ProviderHealthCheck {
  ok: boolean;
  detail: string;
}

export interface AiTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AiProviderHealth {
  dashscope: ProviderHealthCheck;
  deepseek: ProviderHealthCheck;
  fallback: ProviderHealthCheck;
}

const DASHSCOPE_BASE_URL =
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

const DASHSCOPE_CHAT_MODELS = new Set(["qwen-turbo", "qwen-plus"]);
const DASHSCOPE_DEFAULT_CHAT_MODEL = "qwen-turbo";
const DASHSCOPE_TEXT_MODEL = "qwen-max";
const DASHSCOPE_VISION_MODEL = "qwen-vl-max";
/** OpenAI-compatible id for chat; used as default chat model when DeepSeek is primary. */
export const DEEPSEEK_CHAT_MODEL = "deepseek-chat";

function normalizeSecret(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readUsageSource(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const usageMetadata = record.usage_metadata;
  if (usageMetadata && typeof usageMetadata === "object") {
    return usageMetadata as Record<string, unknown>;
  }

  const responseMetadata = record.response_metadata;
  if (responseMetadata && typeof responseMetadata === "object") {
    const responseRecord = responseMetadata as Record<string, unknown>;
    const tokenUsage = responseRecord.token_usage;
    if (tokenUsage && typeof tokenUsage === "object") {
      return tokenUsage as Record<string, unknown>;
    }
  }

  return record;
}

export function normalizeTokenUsage(raw: unknown): AiTokenUsage | null {
  const source = readUsageSource(raw);
  if (!source) return null;

  const promptTokens = toFiniteNumber(
    source.promptTokens ??
      source.prompt_tokens ??
      source.input_tokens ??
      source.inputTokens,
  );
  const completionTokens = toFiniteNumber(
    source.completionTokens ??
      source.completion_tokens ??
      source.output_tokens ??
      source.outputTokens,
  );
  let totalTokens = toFiniteNumber(
    source.totalTokens ?? source.total_tokens ?? source.totalTokens,
  );

  if (promptTokens != null && completionTokens != null) {
    totalTokens = promptTokens + completionTokens;
  }

  if (promptTokens == null && completionTokens == null && totalTokens == null) {
    return null;
  }

  return {
    promptTokens: promptTokens ?? 0,
    completionTokens: completionTokens ?? 0,
    totalTokens: totalTokens ?? 0,
  };
}

export function mergeTokenUsage(
  base: AiTokenUsage | null | undefined,
  next: AiTokenUsage | null | undefined,
): AiTokenUsage | null {
  if (!base) return next ?? null;
  if (!next) return base;

  return {
    promptTokens: base.promptTokens + next.promptTokens,
    completionTokens: base.completionTokens + next.completionTokens,
    totalTokens: base.totalTokens + next.totalTokens,
  };
}

export function getDashscopeApiKey(primaryApiKey?: string): string | null {
  return normalizeSecret(primaryApiKey ?? Deno.env.get("DASHSCOPE_API_KEY"));
}

export function getDeepseekApiKey(backupApiKey?: string): string | null {
  return normalizeSecret(backupApiKey ?? Deno.env.get("DEEPSEEK_API_KEY"));
}

export function resolveDashscopeChatModel(requestedModel?: string): string {
  return requestedModel && DASHSCOPE_CHAT_MODELS.has(requestedModel)
    ? requestedModel
    : DASHSCOPE_DEFAULT_CHAT_MODEL;
}

export function resolveModelForAttempt(
  provider: AiProviderName,
  purpose: AiRequestPurpose,
  requestedModel?: string,
): string {
  if (provider === "dashscope") {
    if (purpose === "cv-vision") return DASHSCOPE_VISION_MODEL;
    if (purpose === "cv-text") return DASHSCOPE_TEXT_MODEL;
    return resolveDashscopeChatModel(requestedModel);
  }

  return DEEPSEEK_CHAT_MODEL;
}

function buildDashscopeAttempt(
  options: {
    purpose: AiRequestPurpose;
    requestedModel?: string;
  },
  dashscopeKey: string,
): ProviderAttempt {
  return {
    provider: "dashscope",
    label: "Alibaba DashScope",
    baseUrl: DASHSCOPE_BASE_URL,
    apiKey: dashscopeKey,
    model: resolveModelForAttempt(
      "dashscope",
      options.purpose,
      options.requestedModel,
    ),
  };
}

function buildDeepseekAttempt(
  options: {
    purpose: AiRequestPurpose;
    requestedModel?: string;
  },
  deepseekKey: string,
): ProviderAttempt {
  return {
    provider: "deepseek",
    label: "DeepSeek",
    baseUrl: DEEPSEEK_BASE_URL,
    apiKey: deepseekKey,
    model: resolveModelForAttempt(
      "deepseek",
      options.purpose,
      options.requestedModel,
    ),
  };
}

/** When user selects DeepSeek chat, try DeepSeek first; DashScope remains failover. */
function preferDeepseekPrimary(
  purpose: AiRequestPurpose,
  requestedModel?: string,
): boolean {
  return purpose === "chat" && requestedModel === DEEPSEEK_CHAT_MODEL;
}

export function createAiAttempts(options: {
  purpose: AiRequestPurpose;
  requestedModel?: string;
  primaryApiKey?: string;
  backupApiKey?: string;
}): ProviderAttempt[] {
  const dashscopeKey = getDashscopeApiKey(options.primaryApiKey);
  const deepseekKey = getDeepseekApiKey(options.backupApiKey);

  const dashscopeAttempt = dashscopeKey
    ? buildDashscopeAttempt(options, dashscopeKey)
    : null;
  const deepseekAttempt =
    options.purpose !== "cv-vision" && deepseekKey
      ? buildDeepseekAttempt(options, deepseekKey)
      : null;

  if (preferDeepseekPrimary(options.purpose, options.requestedModel)) {
    const ordered: ProviderAttempt[] = [];
    if (deepseekAttempt) ordered.push(deepseekAttempt);
    if (dashscopeAttempt) ordered.push(dashscopeAttempt);
    return ordered;
  }

  const attempts: ProviderAttempt[] = [];
  if (dashscopeAttempt) attempts.push(dashscopeAttempt);
  if (deepseekAttempt) attempts.push(deepseekAttempt);
  return attempts;
}

function isQuotaLikeError(status: number, errorText: string): boolean {
  const normalized = errorText.toLowerCase();
  return (
    status === 429 ||
    status === 402 ||
    (status === 503 &&
      /quota|rate limit|too many requests|balance|credit|token|exceed|temporar/i.test(
        normalized,
      )) ||
    /quota|rate limit|insufficient|balance|credit|token(s)? exhausted|exceeded|too many requests|billing/i.test(
      normalized,
    )
  );
}

export function shouldFallbackToBackup(
  status: number,
  errorText: string,
): boolean {
  return isQuotaLikeError(status, errorText);
}

function formatFailure(
  attempts: ProviderAttempt[],
  lastProvider: ProviderAttempt,
  status: number,
  errorText: string,
  fallbackUsed: boolean,
): string {
  const triedProviders = attempts.map((attempt) => attempt.label).join(" -> ");
  const baseMessage = `${lastProvider.label} returned ${status}: ${errorText || "unknown error"}`;
  if (!fallbackUsed) {
    return `${baseMessage}. Tried providers: ${triedProviders}`;
  }

  return `${baseMessage}. Fallback chain: ${triedProviders}`;
}

export async function requestCompatibleCompletionWithFallback(
  attempts: ProviderAttempt[],
  bodyFactory: (attempt: ProviderAttempt) => Record<string, unknown>,
  signal?: AbortSignal,
): Promise<{
  response: Response;
  provider: ProviderAttempt;
  fallbackUsed: boolean;
}> {
  if (attempts.length === 0) {
    throw new Error(
      "No AI provider configured. Set a primary and/or backup API key in Supabase secrets.",
    );
  }

  let lastFailure:
    | { attempt: ProviderAttempt; status: number; errorText: string }
    | null = null;
  let fallbackAttempted = false;

  for (let index = 0; index < attempts.length; index += 1) {
    const attempt = attempts[index];
    try {
      const response = await fetch(
        `${attempt.baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${attempt.apiKey}`,
          },
          body: JSON.stringify({
            ...bodyFactory(attempt),
            model: attempt.model,
          }),
          signal,
        },
      );

      if (response.ok) {
        return {
          response,
          provider: attempt,
          fallbackUsed: index > 0,
        };
      }

      const errorText = await response.text().catch(() => "");
      lastFailure = { attempt, status: response.status, errorText };

      if (index < attempts.length - 1 && shouldFallbackToBackup(response.status, errorText)) {
        console.log(
          `[ai-provider] ${attempt.label} hit quota/rate limit (${response.status}); trying next provider`,
        );
        fallbackAttempted = true;
        continue;
      }

      break;
    } catch (error) {
      const errorText = String(error);
      lastFailure = { attempt, status: 0, errorText };

      if (index < attempts.length - 1) {
        console.log(
          `[ai-provider] ${attempt.label} request failed (${errorText}); trying next provider`,
        );
        fallbackAttempted = true;
        continue;
      }

      break;
    }
  }

  if (!lastFailure) {
    throw new Error("AI provider request failed without a diagnostic response.");
  }

  throw new Error(
    formatFailure(
      attempts,
      lastFailure.attempt,
      lastFailure.status,
      lastFailure.errorText,
      fallbackAttempted,
    ),
  );
}

export function getAiProviderHealth(): AiProviderHealth {
  const dashscopeKey = getDashscopeApiKey();
  const deepseekKey = getDeepseekApiKey();

  const dashscope: ProviderHealthCheck = dashscopeKey
    ? {
      ok: true,
      detail: "DASHSCOPE_API_KEY configured for Alibaba Qwen primary models.",
    }
    : {
      ok: false,
      detail: "DASHSCOPE_API_KEY not set. Add it in Supabase Edge Functions secrets.",
    };

  const deepseek: ProviderHealthCheck = deepseekKey
    ? {
      ok: true,
      detail: "Backup AI key configured for text fallback.",
    }
    : {
      ok: false,
      detail: "Backup AI key not set. Add it in Supabase Edge Functions secrets.",
    };

  const fallback: ProviderHealthCheck = dashscope.ok && deepseek.ok
    ? {
      ok: true,
      detail: "Automatic failover is ready. The backup AI will take over when DashScope is rate-limited or out of quota.",
    }
    : {
      ok: false,
      detail: "Configure both keys to enable automatic failover.",
    };

  return { dashscope, deepseek, fallback };
}
