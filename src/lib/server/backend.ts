import "server-only";
import { ApiError } from "@/lib/api/error";
import type { ApiEnvelope } from "@/lib/api/types";
import { API_BASE_URL } from "@/lib/config";

interface BackendOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
}

/** Calls the API from a Server Component or Route Handler and unwraps `data`. */
export async function backendJson<T>(path: string, options: BackendOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !json?.success) {
    throw new ApiError(json?.message ?? `Request failed (${response.status})`, response.status, json?.errors);
  }
  return json.data;
}
