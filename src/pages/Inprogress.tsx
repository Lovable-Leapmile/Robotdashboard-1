import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { getRobotManagerBase } from "@/lib/api";
import { getStoredAuthToken } from "@/lib/auth";
import noRecordsImage from "@/assets/no_records.png";
import { createDateColumnDef, getDefaultGridProps } from "@/lib/agGridUtils";

// Register AG Grid Community modules (required in v34+)
ModuleRegistry.registerModules([AllCommunityModule]);

interface TaskData {
  tray_id: string;
  status: string;
  station_slot_id: string;
  station_name: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

const Inprogress = () => {
  useAuthSession(); // Session validation
  const [userName, setUserName] = useState("");
  const [rowData, setRowData] = useState<TaskData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quickFilter, setQuickFilter] = useState("");
  const gridApiRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const columnDefs: ColDef<TaskData>[] = [
    {
      field: "tray_id",
      headerName: "Tray ID",
      sortable: true,
      filter: true,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      sortable: true,
      filter: true,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "station_slot_id",
      headerName: "Station Slot ID",
      sortable: true,
      filter: true,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "station_name",
      headerName: "Station Name",
      sortable: true,
      filter: true,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "tags",
      headerName: "Tags",
      sortable: true,
      filter: true,
      flex: 1.5,
      valueFormatter: (params) => {
        if (!params.value || params.value.length === 0) return "N/A";
        return params.value.join(", ");
      },
    },
    createDateColumnDef("created_at", "Created At", { flex: 1.5 }),
    createDateColumnDef("updated_at", "Updated At", { flex: 1.5 }),
  ];

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    setUserName(storedUserName);
    fetchTasksData();
  }, [navigate]);

  const fetchTasksData = async () => {
    try {
      setLoading(true);
      const token = getStoredAuthToken();
      if (!token) return;
      const response = await fetch(`${getRobotManagerBase()}/task?task_status=inprogress`, {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      // Handle "no records found" as a normal case, not an error
      if (response.status === 404 && data.message === "no records found") {
        console.log("No inprogress tasks found");
        setTotalCount(0);
        setRowData([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch tasks data");
      }

      console.log("Fetched inprogress tasks:", data?.records?.length);
      setTotalCount(data.count || 0);
      const mapped = (data.records || []).map((r: any) => ({
        ...r,
        tags: Array.isArray(r.tags)
          ? r.tags
          : typeof r.tags === "string"
            ? r.tags
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [],
      }));
      setRowData(mapped);
    } catch (error) {
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
      <AppHeader selectedTab="" isTasksPage={true} activeTaskTab="Inprogress" />

      <main className="p-2 sm:p-4">
        {!loading && rowData.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 180px)" }}>
            <img src={noRecordsImage} alt="No Record found" className="w-48 sm:w-[340px]" />
          </div>
        ) : (
          <div className="ag-theme-quartz w-full" style={{ height: "calc(100vh - 145px)" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{
                resizable: true,
                minWidth: 100,
                sortable: true,
                filter: true,
              }}
              pagination={true}
              paginationPageSize={50}
              rowHeight={35}
              {...getDefaultGridProps()}
              onGridReady={(params) => {
                gridApiRef.current = params.api;
                params.api.setGridOption("quickFilterText", quickFilter);
                params.api.sizeColumnsToFit();
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Inprogress;
