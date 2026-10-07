const memory = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

export function readCached<T>(key: string): T | null {
  return (memory.get(key) as T | undefined) ?? null;
}

export function writeCached<T>(key: string, value: T) {
  memory.set(key, value);
}

export function invalidateCached(...keys: string[]) {
  for (const key of keys) memory.delete(key);
}

export async function fetchCached<T>(
  key: string,
  url: string,
  options: RequestInit & { force?: boolean } = {}
): Promise<T> {
  const { force = false, ...requestOptions } = options;

  if (!force && memory.has(key)) {
    return memory.get(key) as T;
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

    memory.set(key, data);
    return data as T;
  })();

  inflight.set(key, request);

  try {
    return await request;
  } finally {
    inflight.delete(key);
  }
}
