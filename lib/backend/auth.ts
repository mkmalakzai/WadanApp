import { getBackendConfig, supabaseRest } from "./supabase";

export class AuthNotConfiguredError extends Error {
  constructor() {
    super("Supabase Auth is not configured");
    this.name = "AuthNotConfiguredError";
  }
}

type AuthUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

export type AuthSessionResult = {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user: AuthUser;
};

function getAuthConfig() {
  const backend = getBackendConfig();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!backend.url || !publishableKey) {
    throw new AuthNotConfiguredError();
  }

  return {
    url: backend.url,
    publishableKey,
  };
}

async function authFetch<T>(path: string, body: unknown): Promise<T> {
  const config = getAuthConfig();
  const response = await fetch(`${config.url}/auth/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: config.publishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload?.msg === "string"
        ? payload.msg
        : typeof payload?.message === "string"
          ? payload.message
          : typeof payload?.error_description === "string"
            ? payload.error_description
            : "Authentication request failed.";

    throw new Error(message);
  }

  return payload as T;
}

type SignupTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: AuthUser | null;
};

type SignupResponse = SignupTokenResponse | AuthUser;

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user: AuthUser;
};

async function ensureAppProfile(input: {
  authUser: AuthUser;
  displayName: string;
  email: string;
  phone: string;
  country: string;
}) {
  const rows = await supabaseRest<Array<{ id: string }>>(
    "users?on_conflict=external_user_id",
    {
      method: "POST",
      body: {
        external_user_id: input.authUser.id,
        display_name: input.displayName,
        email: input.email,
        phone: input.phone || null,
        country: input.country,
      },
      prefer: "resolution=merge-duplicates,return=representation",
    }
  );

  let appUserId = rows?.[0]?.id;

  if (!appUserId) {
    const existing = await supabaseRest<Array<{ id: string }>>(
      `users?external_user_id=eq.${encodeURIComponent(input.authUser.id)}&select=id&limit=1`
    );
    appUserId = existing?.[0]?.id;
  }

  if (!appUserId) {
    throw new Error("WADAN profile could not be created.");
  }

  await supabaseRest(
    "wallets?on_conflict=user_id,asset",
    {
      method: "POST",
      body: [
        { user_id: appUserId, asset: "WDC", balance: 0, locked_balance: 0 },
        { user_id: appUserId, asset: "USDT", balance: 0, locked_balance: 0 },
      ],
      prefer: "resolution=ignore-duplicates,return=representation",
    }
  );

  return appUserId;
}

export async function signupWithEmail(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  password: string;
  referralCode?: string;
}) {
  const displayName = [input.firstName, input.lastName].filter(Boolean).join(" ").trim();

  const auth = await authFetch<SignupResponse>("signup", {
    email: input.email,
    password: input.password,
    data: {
      first_name: input.firstName,
      last_name: input.lastName,
      display_name: displayName,
      phone: input.phone || null,
      country: input.country,
      referral_code: input.referralCode || null,
    },
  });

  const authUser =
    "user" in auth && auth.user?.id
      ? auth.user
      : "id" in auth && auth.id
        ? auth
        : null;

  if (!authUser?.id) {
    throw new Error("Signup did not return a user account.");
  }

  const accessToken =
    "access_token" in auth ? auth.access_token : undefined;
  const refreshToken =
    "refresh_token" in auth ? auth.refresh_token : undefined;
  const expiresIn =
    "expires_in" in auth ? auth.expires_in : undefined;

  // With email confirmation enabled, Supabase returns the User object directly
  // and no session token. In that case we wait until the first verified login
  // before creating the app profile/wallets, which avoids creating records for
  // obfuscated signup responses of already-registered emails.
  let appUserId: string | undefined;

  if (accessToken) {
    appUserId = await ensureAppProfile({
      authUser,
      displayName,
      email: input.email,
      phone: input.phone,
      country: input.country,
    });
  }

  return {
    appUserId,
    user: authUser,
    accessToken,
    refreshToken,
    expiresIn,
    requiresEmailConfirmation: !accessToken,
  };
}

export async function loginWithEmail(email: string, password: string): Promise<AuthSessionResult> {
  const auth = await authFetch<LoginResponse>("token?grant_type=password", {
    email,
    password,
  });

  if (!auth.user?.id || !auth.access_token || !auth.refresh_token) {
    throw new Error("Login session could not be created.");
  }

  const meta = auth.user.user_metadata ?? {};
  const displayName =
    typeof meta.display_name === "string"
      ? meta.display_name
      : typeof meta.first_name === "string"
        ? meta.first_name
        : "";

  await ensureAppProfile({
    authUser: auth.user,
    displayName,
    email: auth.user.email ?? email,
    phone: typeof meta.phone === "string" ? meta.phone : auth.user.phone ?? "",
    country: typeof meta.country === "string" ? meta.country : "",
  });

  return {
    accessToken: auth.access_token,
    refreshToken: auth.refresh_token,
    expiresIn: auth.expires_in,
    user: auth.user,
  };
}


export type CurrentAccountProfile = {
  appUserId: string;
  authUserId: string;
  displayName: string;
  email: string;
  phone: string;
  country: string;
  status: string;
  kycStatus: string;
  emailConfirmed: boolean;
  wdcBalance: number;
  usdtBalance: number;
};

type AuthUserDetails = AuthUser & {
  email_confirmed_at?: string | null;
};

export async function getCurrentAccountProfile(accessToken: string): Promise<CurrentAccountProfile> {
  const config = getAuthConfig();

  const userResponse = await fetch(`${config.url}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!userResponse.ok) {
    throw new Error("Session expired. Please log in again.");
  }

  const authUser = (await userResponse.json()) as AuthUserDetails;
  const meta = authUser.user_metadata ?? {};

  const users = await supabaseRest<Array<{
    id: string;
    display_name?: string | null;
    email?: string | null;
    phone?: string | null;
    country?: string | null;
    status?: string | null;
    kyc_status?: string | null;
  }>>(
    `users?external_user_id=eq.${encodeURIComponent(authUser.id)}&select=id,display_name,email,phone,country,status,kyc_status&limit=1`
  );

  const appUser = users?.[0];

  if (!appUser?.id) {
    throw new Error("WADAN profile not found.");
  }

  const wallets = await supabaseRest<Array<{
    asset: "WDC" | "USDT";
    balance?: number | string | null;
  }>>(
    `wallets?user_id=eq.${encodeURIComponent(appUser.id)}&select=asset,balance`
  );

  const wdc = wallets.find((item) => item.asset === "WDC");
  const usdt = wallets.find((item) => item.asset === "USDT");

  return {
    appUserId: appUser.id,
    authUserId: authUser.id,
    displayName:
      appUser.display_name ??
      (typeof meta.display_name === "string" ? meta.display_name : "") ??
      "",
    email: appUser.email ?? authUser.email ?? "",
    phone:
      appUser.phone ??
      (typeof meta.phone === "string" ? meta.phone : authUser.phone ?? "") ??
      "",
    country:
      appUser.country ??
      (typeof meta.country === "string" ? meta.country : "") ??
      "",
    status: appUser.status ?? "active",
    kycStatus: appUser.kyc_status ?? "not_started",
    emailConfirmed: Boolean(authUser.email_confirmed_at),
    wdcBalance: Number(wdc?.balance ?? 0) || 0,
    usdtBalance: Number(usdt?.balance ?? 0) || 0,
  };
}
