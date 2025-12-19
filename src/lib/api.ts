import { getStoredAuthToken } from "@/lib/auth";

export const API_ORIGIN = "https://amsstores1.leapmile.com";
export const ROBOTMANAGER_BASE = `${API_ORIGIN}/robotmanager`;
export const NANOSTORE_BASE = `${API_ORIGIN}/nanostore`;

export const withQuery = (url: string, params: Record<string, string | number | null | undefined>) => {
  const u = new URL(url);
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    u.searchParams.set(k, String(v));
  });
  return u.toString();
};

type ApiFetchOptions = RequestInit & {
  requireAuth?: boolean;
};

export const apiFetch = async (url: string, options: ApiFetchOptions = {}) => {
  const { requireAuth = true, headers, ...rest } = options;

  const h = new Headers(headers);
  h.set("Content-Type", h.get("Content-Type") || "application/json");

  if (requireAuth) {
    const token = getStoredAuthToken();
    if (!token) throw new Error("AUTH_TOKEN_MISSING");
    h.set("Authorization", token);
  }

  return fetch(url, {
    ...rest,
    headers: h,
  });
};

export const apiGet = async <T = any>(url: string, options: ApiFetchOptions = {}) => {
  const res = await apiFetch(url, { ...options, method: "GET" });
  const data = (await res.json()) as T;
  return { res, data };
};
