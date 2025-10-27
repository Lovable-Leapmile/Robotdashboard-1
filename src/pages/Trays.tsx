import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef } from "ag-grid-community";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface TrayData {
  tray_id: string;
  tray_status: string;
  tray_divider: number;
  tray_height: number;
  tray_weight: number;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

const Trays = () => {
  const [userName, setUserName] = useState("");
  const [rowData, setRowData] = useState<TrayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickFilter, setQuickFilter] = useState("");
  const gridApiRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const columnDefs: ColDef<TrayData>[] = [
    { field: "tray_id", headerName: "Tray ID", sortable: true, filter: true, flex: 1 },
    { field: "tray_status", headerName: "Status", sortable: true, filter: true, flex: 1 },
    { field: "tray_divider", headerName: "Divider", sortable: true, filter: true, flex: 1 },
    { field: "tray_height", headerName: "Height (mm)", sortable: true, filter: true, flex: 1 },
    { field: "tray_weight", headerName: "Weight", sortable: true, filter: true, flex: 1 },
    { 
      field: "tags", 
      headerName: "Tags", 
      sortable: true, 
      filter: true, 
      flex: 1.5,
      valueFormatter: (params) => params.value ? params.value.join(", ") : ""
    },
    { 
      field: "created_at", 
      headerName: "Created At", 
      sortable: true, 
      filter: true, 
      flex: 1.5,
      valueFormatter: (params) => {
        if (!params.value) return "";
        try {
          return format(new Date(params.value), "dd-MM-yyyy HH:mm:ss");
        } catch {
          return params.value;
        }
      }
    },
    { 
      field: "updated_at", 
      headerName: "Updated At", 
      sortable: true, 
      filter: true, 
      flex: 1.5,
      valueFormatter: (params) => {
        if (!params.value) return "";
        try {
          return format(new Date(params.value), "dd-MM-yyyy HH:mm:ss");
        } catch {
          return params.value;
        }
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
    fetchTraysData();
  }, [navigate]);

  const fetchTraysData = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://amsstores1.leapmile.com/robotmanager/trays", {
        method: "GET",
        headers: {
          "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trays data");
      }

      const data = await response.json();
      console.log("Fetched trays:", data?.records?.length);
      const mapped = (data.records || []).map((r: any) => ({
        ...r,
        tags: Array.isArray(r.tags)
          ? r.tags
          : typeof r.tags === "string"
          ? r.tags.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [],
      }));
      setRowData(mapped);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load trays data",
        variant: "destructive"
      });
      console.error("Error fetching trays:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <AppHeader selectedTab="Trays" />
      
      <main className="p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Records: {rowData.length}</p>
          <input
            type="text"
            placeholder="Quick filter..."
            value={quickFilter}
            onChange={(e) => {
              setQuickFilter(e.target.value);
              gridApiRef.current?.setGridOption('quickFilterText', e.target.value);
            }}
            className="w-full sm:w-72 rounded-md border border-border px-3 py-2 text-sm bg-background"
            aria-label="Quick filter"
          />
        </div>
        <div className="ag-theme-quartz w-full" style={{ height: 600 }}>
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
              paginationPageSize={20}
              onGridReady={(params) => {
                gridApiRef.current = params.api;
                params.api.setGridOption('quickFilterText', quickFilter);
                params.api.sizeColumnsToFit();
              }}
            />
          </div>
        
      </main>
    </div>
  );
};

export default Trays;
