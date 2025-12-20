import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import noRecordsImage from "@/assets/no_records.png";
import { getDefaultGridProps } from "@/lib/agGridUtils";

// Register AG Grid Community modules (required in v34+)
ModuleRegistry.registerModules([AllCommunityModule]);

interface ExtremeData {
  item_id: string;
  transaction_type: string;
  item_description: string;
  picked_count: number;
}

const Extremes = () => {
  useAuthSession(); // Session validation
  const [userName, setUserName] = useState("");
  const [rowData, setRowData] = useState<ExtremeData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quickFilter, setQuickFilter] = useState("");
  const gridApiRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const columnDefs: ColDef<ExtremeData>[] = [
    {
      field: "item_id",
      headerName: "Item ID",
      sortable: true,
      filter: true,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "transaction_type",
      headerName: "Transaction Type",
      sortable: true,
      filter: true,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "item_description",
      headerName: "Item Description",
      sortable: true,
      filter: true,
      flex: 1.5,
      valueFormatter: (params) => params.value ?? "N/A",
    },
    {
      field: "picked_count",
      headerName: "Count",
      sortable: true,
      filter: true,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A",
    },
  ];

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    setUserName(storedUserName);
    fetchExtremesData();
  }, [navigate]);

  const fetchExtremesData = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://amsstores1.leapmile.com/nanostore/items/usage?order_by=DESC", {
        method: "GET",
        headers: {
          Authorization:
            "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc",
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        setRowData([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch extremes data");
      }

      const data = await response.json();
      console.log("Fetched extremes:", data?.records?.length);
      setTotalCount(data.count || 0);
      setRowData(data.records || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load extremes data",
        variant: "destructive",
      });
      console.error("Error fetching extremes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fafafa" }}>
      <AppHeader selectedTab="Extremes" />

      <main className="p-2 sm:p-4">
        {!loading && rowData.length === 0 ? (
          <div className="flex justify-center items-center" style={{ height: "calc(100vh - 180px)" }}>
            <img src={noRecordsImage} alt="No records found" className="w-48 sm:w-[340px]" />
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

export default Extremes;
