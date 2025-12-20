import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { apiGet, ROBOTMANAGER_BASE, withQuery } from "@/lib/api";
import noRecordsImage from "@/assets/no_records.png";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { createDateColumnDef, getDefaultGridProps } from "@/lib/agGridUtils";

ModuleRegistry.registerModules([AllCommunityModule]);

interface TaskData {
  task_id: string;
  task_type: string;
  tray_id: string;
  status: string;
  rack_id: string;
  row_id: string;
  slot_id: string;
  station_slot_id: string;
  station_name: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

const Completed = () => {
  useAuthSession();
  const [rowData, setRowData] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const gridApiRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const columnDefs: ColDef<TaskData>[] = [
    {
      field: "task_id",
      headerName: "Task ID",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "rack_id",
      headerName: "Rack",
      sortable: true,
      filter: true,
      flex: 0.8,
      minWidth: 80,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "row_id",
      headerName: "Row",
      sortable: true,
      filter: true,
      flex: 0.6,
      minWidth: 60,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "slot_id",
      headerName: "Slot",
      sortable: true,
      filter: true,
      flex: 0.6,
      minWidth: 60,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "tray_id",
      headerName: "Tray ID",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "station_name",
      headerName: "Station",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "tags",
      headerName: "Tags",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => {
        if (!params.value || params.value.length === 0) return "N/A";
        return params.value.join(", ");
      },
    },
    createDateColumnDef("updated_at", "Updated At"),
    createDateColumnDef("created_at", "Created At"),
  ];

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    fetchTasksData();
  }, [navigate]);

  const fetchTasksData = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = withQuery(`${ROBOTMANAGER_BASE}/task`, {
        task_status: "completed",
        order_by_field: "updated_at",
        order_by_type: "DESC",
      });

      const { res, data } = await apiGet(url);

      // Handle "no records found" as a normal case
      if (res.status === 404 && data.message === "no records found") {
        console.log("No completed tasks found");
        setRowData([]);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch tasks data");
      }

      console.log("Fetched completed tasks:", data?.records?.length);
      
      const mapped = (data.records || []).map((r: any) => ({
        task_id: r.task_id || r.id || "N/A",
        task_type: r.task_type || r.type || "N/A",
        tray_id: r.tray_id,
        status: r.status,
        rack_id: r.rack_id || r.rack,
        row_id: r.row_id || r.row,
        slot_id: r.slot_id || r.slot,
        station_slot_id: r.station_slot_id,
        station_name: r.station_name,
        tags: Array.isArray(r.tags)
          ? r.tags
          : typeof r.tags === "string"
            ? r.tags.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
        created_at: r.created_at,
        updated_at: r.updated_at,
      }));
      
      setRowData(mapped);
    } catch (error: any) {
      if (error.message === "AUTH_TOKEN_MISSING") {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      setError("Failed to load tasks data");
      toast({
        title: "Error",
        description: "Failed to load tasks data",
        variant: "destructive",
      });
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fafafa" }}>
      <AppHeader selectedTab="" isTasksPage={true} activeTaskTab="Completed" />

      <main className="p-2 sm:p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 180px)" }}>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading completed tasks...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 180px)" }}>
            <p className="text-destructive">{error}</p>
            <button 
              onClick={fetchTasksData}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : rowData.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 180px)" }}>
            <img src={noRecordsImage} alt="No Record found" className="w-48 sm:w-[340px]" />
          </div>
        ) : (
          <div className="ag-theme-quartz w-full" style={{ height: "calc(100vh - 143px)" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{
                resizable: true,
                minWidth: 60,
                sortable: true,
                filter: true,
              }}
              rowSelection="multiple"
              pagination={true}
              paginationPageSize={50}
              paginationPageSizeSelector={[25, 50, 100, 200]}
              rowHeight={35}
              headerHeight={35}
              {...getDefaultGridProps()}
              onGridReady={(params) => {
                gridApiRef.current = params.api;
                params.api.sizeColumnsToFit();
              }}
              onGridSizeChanged={(params) => {
                params.api.sizeColumnsToFit();
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Completed;
