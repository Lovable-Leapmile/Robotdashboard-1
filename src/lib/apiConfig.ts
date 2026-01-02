const API_CONFIG_KEY = "api_config";
const API_NAME_KEY = "apiname";
const ROBOT_NAME_KEY = "robotname";

export interface ApiConfig {
  apiName: string;
  baseUrl: string;
}

export const getStoredApiConfig = (): ApiConfig | null => {
  try {
    const stored = localStorage.getItem(API_CONFIG_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as ApiConfig;
    if (parsed.apiName && parsed.baseUrl) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const storeApiConfig = (apiName: string): ApiConfig => {
  const trimmed = apiName.trim();
  const baseUrl = `https://${trimmed}.com`;
  const config: ApiConfig = { apiName: trimmed, baseUrl };
  localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
  // Also store apiname separately for easy access
  localStorage.setItem(API_NAME_KEY, trimmed);
  return config;
};

export const clearApiConfig = (): void => {
  localStorage.removeItem(API_CONFIG_KEY);
  localStorage.removeItem(API_NAME_KEY);
  localStorage.removeItem(ROBOT_NAME_KEY);
};

export const isApiConfigured = (): boolean => {
  return getStoredApiConfig() !== null;
};

export const getApiBaseUrl = (): string => {
  const config = getStoredApiConfig();
  if (!config) {
    throw new Error("API_NOT_CONFIGURED");
  }
  return config.baseUrl;
};

// Get the stored apiname from localStorage
export const getStoredApiName = (): string | null => {
  return localStorage.getItem(API_NAME_KEY);
};

// Get the stored robotname from localStorage
export const getStoredRobotName = (): string | null => {
  return localStorage.getItem(ROBOT_NAME_KEY);
};

// Store the robot name in localStorage
export const storeRobotName = (robotName: string): void => {
  localStorage.setItem(ROBOT_NAME_KEY, robotName);
};

// Get the pubsub topic constructed from apiname and robotname
// Extract just the first part of the apiname (before the first dot) for the topic
export const getPubSubTopic = (): string | null => {
  const apiName = getStoredApiName();
  const robotName = getStoredRobotName();
  if (!apiName || !robotName) return null;
  
  // Extract apiname prefix (e.g., "amsstores1" from "amsstores1.leapmile")
  const apiNamePrefix = apiName.split('.')[0];
  return `${apiNamePrefix}_${robotName}`;
};
