import { API_BACKEND } from "@/lib/utils/constanst";
import { getCookie } from "cookies-next";
import { extractBearerToken } from "./auth.service";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
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
    const message = getErrorMessage(errorBody, response.status, response.statusText);
    throw new ApiError(message, response.status);
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
