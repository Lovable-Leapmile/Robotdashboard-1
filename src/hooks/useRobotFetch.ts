import { useEffect, useState, useCallback } from "react";
import { getRobotManagerBase } from "@/lib/api";
import { getStoredAuthToken } from "@/lib/auth";
import { storeRobotName, getStoredRobotName, isApiConfigured } from "@/lib/apiConfig";

interface Robot {
  robot_name: string;
  [key: string]: any;
}

interface UseRobotFetchResult {
  robotName: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRobotFetch = (): UseRobotFetchResult => {
  const [robotName, setRobotName] = useState<string | null>(getStoredRobotName());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRobots = useCallback(async () => {
    // Only fetch if API is configured and we have a token
    if (!isApiConfigured()) {
      return;
    }

    const token = getStoredAuthToken();
    if (!token) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${getRobotManagerBase()}/robots`, {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch robots: ${response.status}`);
      }

      const data = await response.json();
      console.log("Robots API Response:", data);

      // Extract robot_name from the response
      // Handle various response formats: records array, robots array, direct array, or single object
      let robotNameValue: string | null = null;

      if (data.records && Array.isArray(data.records) && data.records.length > 0) {
        robotNameValue = data.records[0].robot_name;
      } else if (Array.isArray(data) && data.length > 0) {
        robotNameValue = data[0].robot_name;
      } else if (data.robots && Array.isArray(data.robots) && data.robots.length > 0) {
        robotNameValue = data.robots[0].robot_name;
      } else if (data.robot_name) {
        robotNameValue = data.robot_name;
      }

      if (robotNameValue) {
        storeRobotName(robotNameValue);
        setRobotName(robotNameValue);
        console.log("Robot name stored:", robotNameValue);
      } else {
        setError("No robot_name found in response");
      }
    } catch (err) {
      console.error("Error fetching robots:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRobots();
  }, [fetchRobots]);

  return {
    robotName,
    isLoading,
    error,
    refetch: fetchRobots,
  };
};
