import { useEffect, useState, useCallback, useRef } from "react";
import { getStoredAuthToken } from "@/lib/auth";
import { getPubSubBase } from "@/lib/api";
import { getPubSubTopic } from "@/lib/apiConfig";

export interface ShuttleState {
  // Initial data from first record
  shuttle_move_tray: string | null;
  shuttle_move_rack: number | null;
  shuttle_move_slot: string | null;
  shuttle_move_row: number | null;
  
  // Store/Retrieve flow data
  store_row: number;
  store_rack: number | null;
  store_slot: number | null;
  store_depth: number | null;
  shuttle_action: string | null;
  store_data_display: string;
  destination_name: number | null;
}

const initialState: ShuttleState = {
  shuttle_move_tray: null,
  shuttle_move_rack: null,
  shuttle_move_slot: null,
  shuttle_move_row: null,
  store_row: -1,
  store_rack: null,
  store_slot: null,
  store_depth: null,
  shuttle_action: null,
  store_data_display: "Ongoing",
  destination_name: null,
};

interface PubSubRecord {
  message: string | {
    row?: number;
    rack?: number;
    slot?: number;
    depth?: number;
    action?: string;
    status?: string;
    success?: boolean;
    metadata?: {
      tray_id?: string;
      slot_id?: string;
    };
  };
}

interface ParsedMessage {
  row: number;
  rack: number;
  slot: number;
  depth: number;
  action: string;
  status: string;
  success: boolean;
  metadata: {
    tray_id: string | null;
    slot_id: string | null;
  };
}

const parseMessage = (record: PubSubRecord): ParsedMessage => {
  const message = typeof record.message === "string" 
    ? JSON.parse(record.message) 
    : record.message;
  
  return {
    row: message.row ?? 0,
    rack: message.rack ?? 0,
    slot: message.slot ?? 0,
    depth: message.depth ?? 0,
    action: message.action ?? "",
    status: message.status ?? "",
    success: message.success ?? true,
    metadata: {
      tray_id: message.metadata?.tray_id ?? null,
      slot_id: message.metadata?.slot_id ?? null,
    },
  };
};

export const useShuttlePubSub = () => {
  const [shuttleState, setShuttleState] = useState<ShuttleState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPubSubData = useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setError("No auth token found");
      return;
    }

    // Get dynamic topic from localStorage
    const topic = getPubSubTopic();
    if (!topic) {
      setError("PubSub topic not configured. Missing apiname or robotname.");
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      const response = await fetch(
        `${getPubSubBase()}/subscribe?topic=${topic}&num_records=4`,
        {
          method: "GET",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch PubSub data");
      }

      const data = await response.json();
      console.log("PubSub API Response:", data);

      if (!data.records || data.records.length === 0) {
        console.log("No records in PubSub response");
        return;
      }

      // Parse first and second records
      const firstRecord = parseMessage(data.records[0]);
      const secondRecord = data.records.length > 1 
        ? parseMessage(data.records[1]) 
        : null;

      console.log("Parsed First Record:", firstRecord);
      if (secondRecord) console.log("Parsed Second Record:", secondRecord);

      // STEP 2: Initial data storage from first record
      const initialData = {
        shuttle_move_tray: firstRecord.metadata.tray_id,
        shuttle_move_rack: firstRecord.rack,
        shuttle_move_slot: firstRecord.metadata.slot_id,
        shuttle_move_row: firstRecord.row,
      };

      // Run parallel functions
      const runParallelFunctions = () => {
        let newState: Partial<ShuttleState> = { ...initialData };

        // PARALLEL FUNCTION 1: STORE FLOW
        const storeFlow = () => {
          // Action 1: Store → Start
          if (firstRecord.action === "store" && firstRecord.status === "start") {
            console.log("Store Start detected");
            newState = {
              ...newState,
              store_row: firstRecord.row,
              store_rack: firstRecord.rack,
              store_slot: firstRecord.slot,
              store_depth: firstRecord.depth,
              shuttle_action: "Storing",
              store_data_display: "Storing",
              destination_name: firstRecord.slot,
            };
          }

          // Action 2: Store → Stop
          if (firstRecord.action === "store" && firstRecord.status === "stop") {
            if (firstRecord.success) {
              console.log("Store Stop Success");
              newState = {
                ...newState,
                store_row: firstRecord.row,
                store_rack: firstRecord.rack,
                store_slot: firstRecord.slot,
                store_depth: firstRecord.depth,
                shuttle_action: "Stored",
                store_data_display: "Stored",
                destination_name: firstRecord.slot,
              };
            } else {
              console.log("Store Stop Failed");
              newState = {
                ...newState,
                store_row: -1,
                store_rack: null,
                store_slot: null,
                shuttle_action: null,
                store_depth: null,
                store_data_display: "Ongoing",
                destination_name: null,
              };
            }
          }
        };

        // PARALLEL FUNCTION 2: RETRIEVE FLOW
        const retrieveFlow = () => {
          // Action 1: Retrieve → Stop
          if (firstRecord.action === "retrieve" && firstRecord.status === "stop") {
            if (firstRecord.success) {
              console.log("Retrieve Stop Success");
              newState = {
                ...newState,
                store_row: firstRecord.row,
                store_rack: firstRecord.rack,
                store_slot: firstRecord.slot,
                store_depth: firstRecord.depth,
                shuttle_action: "Retrieved",
                store_data_display: "Retrieved",
                destination_name: firstRecord.slot,
              };
            } else if (secondRecord) {
              console.log("Retrieve Stop Failed - Using second record");
              newState = {
                ...newState,
                store_row: secondRecord.row,
                store_rack: secondRecord.rack,
                store_slot: secondRecord.slot,
                store_depth: secondRecord.depth,
                shuttle_action: "Storing",
                store_data_display: "Retrieved",
                destination_name: secondRecord.slot,
              };
            }
          }

          // Action 2: Retrieve → Start
          if (firstRecord.action === "retrieve" && firstRecord.status === "start") {
            if (firstRecord.success) {
              console.log("Retrieve Start Success");
              // First clear, then set new values
              newState = {
                ...newState,
                store_row: firstRecord.row,
                store_rack: firstRecord.rack,
                store_slot: firstRecord.slot,
                store_depth: firstRecord.depth,
                shuttle_action: "Retrieve",
                store_data_display: "Retrieve",
                destination_name: firstRecord.slot,
              };
            }
          }
        };

        // Execute both flows in parallel (synchronously since they're pure functions)
        storeFlow();
        retrieveFlow();

        return newState;
      };

      const updatedState = runParallelFunctions();
      
      setShuttleState((prev) => ({
        ...prev,
        ...updatedState,
      }));
      
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Ignore abort errors
      }
      console.error("Error fetching PubSub data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch on mount
    fetchPubSubData();

    // Poll every 1 second
    const interval = setInterval(fetchPubSubData, 1000);

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPubSubData]);

  return {
    shuttleState,
    isLoading,
    error,
    refetch: fetchPubSubData,
  };
};
