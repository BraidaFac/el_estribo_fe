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
  const response = await fetch(`${API_BACKEND}${endpoint}`, {
    ...init, headers: {
      "Content-Type": "application/json", 
      ...init?.headers,
      "Authorization": `Bearer ${extractBearerToken(getCookie("Authorization"))}`,
   }});

  if (!response.ok) {
    const errorBody = await safeJsonParse(response);
    const message =
      errorBody?.message ||
      `Request failed: ${response.status} ${response.statusText}`;
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
