export const AUTH_TOKEN_STORAGE_KEY = "auth_token";

const candidateKeys = [
  AUTH_TOKEN_STORAGE_KEY,
  "token",
  "access_token",
  "Authorization",
  "authorization",
] as const;

export const getStoredAuthToken = (): string | null => {
  for (const key of candidateKeys) {
    const v = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (v && v.trim()) return v.trim();
  }
  return null;
};

export const storeAuthToken = (rawToken: unknown) => {
  if (typeof rawToken !== "string") return;
  const t = rawToken.trim();
  if (!t) return;

  const normalized = t.toLowerCase().startsWith("bearer ") ? t : `Bearer ${t}`;
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, normalized);
};
