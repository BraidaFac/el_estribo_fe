import { API_BACKEND } from "@/lib/utils/constanst";
import { deleteCookie, getCookie } from "cookies-next";
import { extractBearerToken } from "./auth.service";

/** 401 en estos endpoints no implica sesión caducada (p. ej. contraseña incorrecta). */
const AUTH_401_WITHOUT_SESSION_REDIRECT = ["/auth/login"];

export class ApiError extends Error {
  status: number;
  /** Cuerpo JSON del error (si el backend lo envió), p. ej. puedeUltimoMomento o codigo. */
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BACKEND}${endpoint}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
        Authorization: `Bearer ${extractBearerToken(getCookie("Authorization"))}`,
      },
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el backend. Revisa tu red o la URL configurada.",
      0,
    );
  }

  if (!response.ok) {
    const errorBody = await safeJsonParse(response);
    const message = getErrorMessage(
      errorBody,
      response.status,
      response.statusText,
    );

    if (response.status === 401) {
      deleteCookie("Authorization");
      const skipRedirect = AUTH_401_WITHOUT_SESSION_REDIRECT.some((prefix) =>
        endpoint.startsWith(prefix),
      );
      if (
        typeof window !== "undefined" &&
        !skipRedirect &&
        window.location.pathname !== "/login"
      ) {
        window.location.replace("/login");
      }
    }
    throw new ApiError(message, response.status, errorBody);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

async function safeJsonParse(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(
  errorBody: any,
  status: number,
  statusText: string,
): string {
  const rawMessage = errorBody?.message;

  if (Array.isArray(rawMessage)) {
    return rawMessage.join(", ");
  }

  if (typeof rawMessage === "string" && rawMessage.trim()) {
    return rawMessage;
  }

  return `Request failed: ${status} ${statusText}`;
}
