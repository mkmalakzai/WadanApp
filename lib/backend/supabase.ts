export class BackendNotConfiguredError extends Error {
  constructor() {
    super("Backend is not configured");
    this.name = "BackendNotConfiguredError";
  }
}

function normalizeSupabaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");
  return trimmed.replace(/\/rest\/v1(?:\/.*)?$/, "");
}

export function getBackendConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  return {
    url: url ? normalizeSupabaseUrl(url) : "",
    secretKey: secretKey ?? "",
    configured: Boolean(url && secretKey),
  };
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  prefer?: string;
};

export async function supabaseRest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const config = getBackendConfig();

  if (!config.configured) {
    throw new BackendNotConfiguredError();
  }

  const cleanPath = path.replace(/^\\/+/, "");

  const response = await fetch(`${config.url}/rest/v1/${cleanPath}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: config.secretKey,
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Backend request failed (${response.status}): ${message || response.statusText}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
