import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import noRecordsImage from "@/assets/no_records.png";

// Register AG Grid Community modules (required in v34+)
ModuleRegistry.registerModules([AllCommunityModule]);

interface LogData {
  created_at: string;
  message: any;
  station_slot_id: string;
  station_name: string;
  tray_id: string;
  slot_id: string;
  state: string;
}

const Logs = () => {
  const [userName, setUserName] = useState("");
  const [rowData, setRowData] = useState<LogData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quickFilter, setQuickFilter] = useState("");
  const gridApiRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const columnDefs: ColDef<LogData>[] = [
    { 
      field: "created_at", 
      headerName: "Created At", 
      sortable: true, 
      filter: true, 
      flex: 1.5,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        try {
          return format(new Date(params.value), "dd-MM-yyyy HH:mm:ss");
        } catch {
          return params.value;
        }
      }
    },
    { 
      field: "message", 
      headerName: "Message", 
      sortable: true, 
      filter: true, 
      flex: 2,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        
        // If message is an object with a 'msg' field, use that
        let messageStr = "";
        if (typeof params.value === "object" && params.value.msg) {
          messageStr = params.value.msg;
        } else if (typeof params.value === "object") {
          messageStr = JSON.stringify(params.value);
        } else {
          messageStr = String(params.value);
        }
        
        // Trim at \n
        const newlineIndex = messageStr.indexOf("\\n");
        if (newlineIndex !== -1) {
          messageStr = messageStr.substring(0, newlineIndex);
        }
        return messageStr;
      }
    },
    { 
      field: "message", 
      headerName: "Action", 
      sortable: true, 
      filter: true, 
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        if (typeof params.value === "object" && params.value.metadata?.station_slot_id) {
          return params.value.metadata.station_slot_id;
        }
        return "N/A";
      }
    },
    { 
      field: "message", 
      headerName: "Status", 
      sortable: true, 
      filter: true, 
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        if (typeof params.value === "object" && params.value.status) {
          return params.value.status;
        }
        return "N/A";
      }
    },
    { 
      field: "message", 
      headerName: "Tray ID", 
      sortable: true, 
      filter: true, 
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        if (typeof params.value === "object" && params.value.metadata?.tray_id) {
          return params.value.metadata.tray_id;
        }
        return "N/A";
      }
    },
    { 
      field: "message", 
      headerName: "Slot ID", 
      sortable: true, 
      filter: true, 
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        if (typeof params.value === "object" && params.value.metadata?.slot_id) {
          return params.value.metadata.slot_id;
        }
        return "N/A";
      }
    },
    { 
      field: "message", 
      headerName: "State", 
      sortable: true, 
      filter: true, 
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        if (typeof params.value === "object" && params.value.metadata?.state) {
          return params.value.metadata.state;
        }
        return "N/A";
      }
    }
  ];

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    setUserName(storedUserName);
    fetchLogsData();
  }, [navigate]);

  const fetchLogsData = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://amsstores1.leapmile.com/pubsub/subscribe?topic=amsstores1_AMSSTORES1-Nano", {
        method: "GET",
        headers: {
          "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc",
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      // Handle "no records found" as a normal case, not an error
      if (response.status === 404 && data.message === "no records found") {
        console.log("No logs found");
        setTotalCount(0);
        setRowData([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch logs data");
      }

      console.log("Fetched logs:", data?.records?.length);
      setTotalCount(data.count || 0);
      setRowData(data.records || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load logs data",
        variant: "destructive"
      });
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <AppHeader selectedTab="" isLogsPage={true} />
      
      <main className="p-6">
        {!loading && rowData.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
            <img 
              src={noRecordsImage} 
              alt="No Record found" 
              style={{ width: '340px' }}
            />
          </div>
        ) : (
          <div className="ag-theme-quartz w-full" style={{ height: 'calc(100vh - 120px)' }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{
                resizable: true,
                minWidth: 100,
                sortable: true,
                filter: true
              }}
              pagination={true}
              paginationPageSize={50}
              rowHeight={60}
              onGridReady={(params) => {
                gridApiRef.current = params.api;
                params.api.setGridOption('quickFilterText', quickFilter);
                params.api.sizeColumnsToFit();
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Logs;
