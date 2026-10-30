import "server-only";

import { ChatbotError } from "./contracts";

type Window = { key: string; limit: number; ttl: number };
const localCounters = new Map<string, { count: number; expiresAt: number }>();

function positiveLimit(value: string | undefined, fallback: number): number {
  if (value === undefined || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new ChatbotError("configuration");
  }
  return parsed;
}

// O script verifica e incrementa todas as janelas numa operação atômica.
const LIMIT_SCRIPT = `
for i, key in ipairs(KEYS) do
  if tonumber(redis.call('GET', key) or '0') >= tonumber(ARGV[(i-1)*2+1]) then
    return math.max(1, redis.call('TTL', key))
  end
end
for i, key in ipairs(KEYS) do
  local count = redis.call('INCR', key)
  if count == 1 then redis.call('EXPIRE', key, ARGV[(i-1)*2+2]) end
end
return 0
`;

export async function checkChatRateLimit(signal?: AbortSignal): Promise<number> {
  const now = Date.now();
  const windows: Window[] = [
    {
      key: `portfolio:chat:minute:${Math.floor(now / 60000)}`,
      limit: positiveLimit(process.env.CHATBOT_REQUESTS_PER_MINUTE, 5),
      ttl: Math.max(1, Math.ceil((60000 - now % 60000) / 1000)),
    },
    {
      key: `portfolio:chat:day:${Math.floor(now / 86400000)}`,
      limit: positiveLimit(process.env.CHATBOT_REQUESTS_PER_DAY, 50),
      ttl: Math.max(1, Math.ceil((86400000 - now % 86400000) / 1000)),
    },
  ];

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url && !token && process.env.NODE_ENV === "development" && !process.env.VERCEL) {
    for (const [key, counter] of localCounters) {
      if (counter.expiresAt <= now) localCounters.delete(key);
    }
    for (const window of windows) {
      const counter = localCounters.get(window.key);
      if (counter && counter.count >= window.limit) {
        return Math.max(1, Math.ceil((counter.expiresAt - now) / 1000));
      }
    }
    for (const window of windows) {
      const counter = localCounters.get(window.key);
      localCounters.set(window.key, {
        count: (counter?.count ?? 0) + 1,
        expiresAt: counter?.expiresAt ?? now + window.ttl * 1000,
      });
    }
    return 0;
  }

  // Sem contador compartilhado, produção recusa consultas ao Gemini.
  if (!url || !token || !url.startsWith("https://")) {
    throw new ChatbotError("configuration");
  }

  try {
    const timeout = AbortSignal.timeout(3000);
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        "EVAL", LIMIT_SCRIPT, windows.length,
        ...windows.map((window) => window.key),
        ...windows.flatMap((window) => [window.limit, window.ttl]),
      ]),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Rate limiter unavailable");
    const data: unknown = await response.json();
    if (
      typeof data !== "object" || data === null || !("result" in data) ||
      typeof data.result !== "number" || !Number.isSafeInteger(data.result) || data.result < 0 ||
      ("error" in data && data.error)
    ) {
      throw new Error("Invalid rate limiter response");
    }
    return data.result;
  } catch {
    throw new ChatbotError(signal?.aborted ? "aborted" : "unavailable");
  }
}
