import { ApiError, apiFetch } from "./http";

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export type AuthUser = {
  name: string;
  role: Role;
};

type ValidateResponse = {
  username: string;
  role: Role;
};

type LoginResponse = {
  access_token: string;
  user: AuthUser;
};

type SignupPayload = {
  userName: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
  name: FormDataEntryValue | null;
};

export async function validateToken(token: string): Promise<AuthUser | null> {
  try {
    const data = await apiFetch<ValidateResponse>("/auth/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    return {
      name: data.username,
      role: data.role,
    };
  } catch {
    return null;
  }
}

export async function login(
  userName: FormDataEntryValue | null,
  password: FormDataEntryValue | null,
): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, password }),
  });

  return {
    access_token: data.access_token,
    user: {
      name: data.user.name,
      role: data.user.role,
    },
  };
}

export async function signup(payload: SignupPayload): Promise<void> {
  const body = JSON.stringify(payload);

  try {
    await apiFetch("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) {
      throw error;
    }

    await apiFetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  }
}

export function extractBearerToken(cookieValue: unknown): string {
  if (typeof cookieValue !== "string") return "";
  const parts = cookieValue.includes("Bearer") ? cookieValue.split(" ") : null;
  if (parts === null || parts.length < 2) return "";
  return parts[0] === "Bearer" ? parts[1] : "";
}
