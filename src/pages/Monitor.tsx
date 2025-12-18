import { useEffect, useState, useRef, useCallback, memo } from "react";
import AppHeader from "@/components/AppHeader";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusMessage {
  msg?: string;
  UPTIME?: string;
  "GOTO OPS"?: string;
  ROBOT_ID?: string;
  "PLC READS"?: string;
  "STORE OPS"?: string;
  device_id?: string;
  "PLC ERRORS"?: string;
  "PLC WRITES"?: string;
  "NUM HOMINGS"?: string;
  "RETRIEVE OPS"?: string;
  "RECOVERIES MAGNET"?: string;
  "SUPERVISOR STATUS"?: string;
  "RECOVERIES HORZVERT"?: string;
  "RECOVERIES PUSHPULL"?: string;
  "SUPERVISOR START TIME"?: string;
  [key: string]: string | undefined;
}

interface StatusCardProps {
  label: string;
  value: string | undefined;
}

const StatusCard = memo(({ label, value }: StatusCardProps) => (
  <div className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 truncate">
      {label.replace(/_/g, " ")}
    </p>
    <p className="text-lg font-semibold text-foreground truncate" title={value ?? "N/A"}>
      {value ?? "N/A"}
    </p>
  </div>
));

StatusCard.displayName = "StatusCard";

const LoadingSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
    {Array.from({ length: 16 }).map((_, i) => (
      <div key={i} className="bg-card border border-border rounded-lg p-4">
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-6 w-24" />
      </div>
    ))}
  </div>
);

const Monitor = () => {
  useAuthSession();
  const [statusData, setStatusData] = useState<StatusMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousDataRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchStatus = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    
    if (!token) {
      setError("Not authenticated. Please login first.");
      setIsLoading(false);
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch(
        "https://amsstores1.leapmile.com/pubsub/subscribe?topic=STATUSMONITOR_EVENTS&num_records=1",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please login again.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data?.records?.[0]?.message) {
        const newDataString = JSON.stringify(data.records[0].message);
        
        // Only update state if data actually changed
        if (newDataString !== previousDataRef.current) {
          previousDataRef.current = newDataString;
          setStatusData(data.records[0].message);
        }
      }
      
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Ignore abort errors
      }
      setError(err instanceof Error ? err.message : "Failed to fetch status");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    
    const intervalId = setInterval(fetchStatus, 500);
    
    return () => {
      clearInterval(intervalId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchStatus]);

  const renderStatusCards = () => {
    if (!statusData) return null;

    const entries = Object.entries(statusData).filter(
      ([key]) => key !== "msg" && key !== "device_id"
    );

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {entries.map(([key, value]) => (
          <StatusCard key={key} label={key} value={value} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader selectedTab="" isMonitorPage={true} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header with status indicator */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h1 className="text-xl font-semibold text-foreground">System Status Monitor</h1>
            <div className="flex items-center gap-2">
              {statusData?.msg === "ok" ? (
                <span className="flex items-center gap-2 text-sm text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-2 h-2 bg-muted rounded-full" />
                  Waiting...
                </span>
              )}
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="m-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && <LoadingSkeleton />}

          {/* Status cards */}
          {!isLoading && !error && renderStatusCards()}

          {/* Empty state */}
          {!isLoading && !error && !statusData && (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No status data available</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Monitor;
