import { getStoredAuthToken } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/apiConfig";

// Dynamic API base URL - retrieved from stored configuration
export const getApiOrigin = (): string => getApiBaseUrl();

export const getRobotManagerBase = (): string => `${getApiOrigin()}/robotmanager`;
export const getNanostoreBase = (): string => `${getApiOrigin()}/nanostore`;
export const getUserBase = (): string => `${getApiOrigin()}/user`;
export const getPubSubBase = (): string => `${getApiOrigin()}/pubsub`;
export const getCameraManagerBase = (): string => `${getApiOrigin()}/cameramanager`;

// Get the API origin with optional port for admin console
export const getAdminConsoleUrl = (): string => {
  const origin = getApiOrigin();
  return origin.replace('.leapmile.com', '.leapmile.com:5700');
};

// Get the web app URL with port 6500
export const getWebAppUrl = (): string => {
  const origin = getApiOrigin();
  return origin.replace('.leapmile.com', '.leapmile.com:6500');
};

// Legacy exports for backward compatibility - these are now deprecated
// Components should migrate to using the getter functions above
export const API_ORIGIN = ""; // Deprecated - use getApiOrigin()
export const ROBOTMANAGER_BASE = ""; // Deprecated - use getRobotManagerBase()
export const NANOSTORE_BASE = ""; // Deprecated - use getNanostoreBase()

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
