import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import noRecordsImage from "@/assets/no_records.png";

// Register AG Grid Community modules (required in v34+)
ModuleRegistry.registerModules([AllCommunityModule]);

interface SlotData {
  slot_id: string;
  tray_id: string;
  slot_name: string;
  tags: string[] | null;
  slot_height: number;
  status: string;
  updated_at: string;
}

const Slots = () => {
  useAuthSession(); // Session validation
  const [userName, setUserName] = useState("");
  const [rowData, setRowData] = useState<SlotData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quickFilter, setQuickFilter] = useState("");
  const gridApiRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const columnDefs: ColDef<SlotData>[] = [
    { 
      field: "slot_id", 
      headerName: "Slot ID", 
      sortable: true, 
      filter: true, 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "tray_id", 
      headerName: "Tray ID", 
      sortable: true, 
      filter: true, 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "slot_name", 
      headerName: "Friendly Name", 
      sortable: true, 
      filter: true, 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
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
      }
    },
    { 
      field: "slot_height", 
      headerName: "Height (mm)", 
      sortable: true, 
      filter: true, 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "status", 
      headerName: "Status", 
      sortable: true, 
      filter: true, 
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "updated_at", 
      headerName: "Updated At", 
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
    fetchSlotsData();
  }, [navigate]);

  const fetchSlotsData = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://amsstores1.leapmile.com/robotmanager/slots", {
        method: "GET",
        headers: {
          "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc",
          "Content-Type": "application/json"
        }
      });

      if (response.status === 404) {
        setRowData([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch slots data");
      }

      const data = await response.json();
      console.log("Fetched slots:", data?.records?.length);
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
        description: "Failed to load slots data",
        variant: "destructive"
      });
      console.error("Error fetching slots:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <AppHeader selectedTab="Slots" />
      
      <main className="p-3 sm:p-6">
        {!loading && rowData.length === 0 ? (
          <div className="flex justify-center items-center" style={{ height: 'calc(100vh - 180px)' }}>
            <img 
              src={noRecordsImage} 
              alt="No records found" 
              className="w-48 sm:w-[340px]"
            />
          </div>
        ) : (
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

export default Slots;
