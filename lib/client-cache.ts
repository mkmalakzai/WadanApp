type CacheEntry = {
  value: unknown;
  at: number;
};

const memory = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();
let refreshPromise: Promise<boolean> | null = null;

export function readCached<T>(key: string): T | null {
  return (memory.get(key)?.value as T | undefined) ?? null;
}

export function writeCached<T>(key: string, value: T) {
  memory.set(key, { value, at: Date.now() });
}

export function invalidateCached(...keys: string[]) {
  for (const key of keys) memory.delete(key);
}

async function refreshSessionOnce() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        cache: "no-store",
      });

      if (response.ok) return true;

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function requestJson<T>(url: string, requestOptions: RequestInit, allowRefresh = true): Promise<T> {
  let response = await fetch(url, {
    ...requestOptions,
    cache: "no-store",
  });

  if (response.status === 401 && allowRefresh) {
    const refreshed = await refreshSessionOnce();
    if (refreshed) {
      response = await fetch(url, {
        ...requestOptions,
        cache: "no-store",
      });
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Unable to load WADAN data.");
  }

  return data as T;
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
    const data = await requestJson<T>(url, requestOptions);
    writeCached(key, data);
    return data;
  })();

  inflight.set(key, request);

  try {
    return await request;
  } finally {
    inflight.delete(key);
  }
}

// Reward settlement is an authenticated POST. The database RPC locks positions
// and stores paid days, so repeat requests cannot credit the same day twice.
// Before the SQL migration is installed, the site continues to load normally.
export async function syncStakingRewards(): Promise<number> {
  try {
    const response = await fetchCached<{
      ok: boolean;
      result?: { credited_wdc?: number | string };
    }>("staking:settlement","/api/staking/settle",{
      method:"POST",
      staleMs:120_000,
    });
    const credited = Number(response.result?.credited_wdc ?? 0);
    if (credited > 0) {
      invalidateCached("wallet:summary","staking:overview","account:me","history");
    }
    return credited;
  } catch {
    return 0;
  }
}
