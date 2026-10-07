type CacheEntry = {
  value: unknown;
  at: number;
};

const memory = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

export function readCached<T>(key: string): T | null {
  return (memory.get(key)?.value as T | undefined) ?? null;
}

export function writeCached<T>(key: string, value: T) {
  memory.set(key, { value, at: Date.now() });
}

export function invalidateCached(...keys: string[]) {
  for (const key of keys) memory.delete(key);
}

export async function fetchCached<T>(
  key: string,
  url: string,
  options: RequestInit & { force?: boolean; staleMs?: number } = {}
): Promise<T> {
  const { force = false, staleMs = 15_000, ...requestOptions } = options;
  const cached = memory.get(key);

  if (!force && cached && Date.now() - cached.at < staleMs) {
    return cached.value as T;
  }

  if (!force && inflight.has(key)) {
    return inflight.get(key) as Promise<T>;
  }

  const request = (async () => {
    const response = await fetch(url, {
      ...requestOptions,
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Unable to load WADAN data.");
    }

    writeCached(key, data);
    return data as T;
  })();

  inflight.set(key, request);

  try {
    return await request;
  } finally {
    inflight.delete(key);
  }
}
