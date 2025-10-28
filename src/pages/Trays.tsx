import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Register AG Grid Community modules (required in v34+)
ModuleRegistry.registerModules([AllCommunityModule]);
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
  const [totalCount, setTotalCount] = useState(0);
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
      valueFormatter: (params) => {
        if (!params.value || params.value.length === 0) return "N/A";
        return params.value.join(", ");
      }
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
      setTotalCount(data.count || 0);
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
      
      <main className="p-6">
        <div className="ag-theme-quartz w-full" style={{ height: 'calc(100vh - 180px)' }}>
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
              paginationPageSize={30}
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
