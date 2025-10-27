import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
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
      setRowData(data.records || []);
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
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: 600 }}>
            <p style={{ color: '#351C75' }}>Loading trays data...</p>
          </div>
        ) : (
          <div className="ag-theme-alpine w-full" style={{ height: 600 }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{
                resizable: true,
                minWidth: 100
              }}
              pagination={true}
              paginationPageSize={20}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Trays;
