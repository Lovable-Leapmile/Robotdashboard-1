import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { apiGet, NANOSTORE_BASE, ROBOTMANAGER_BASE, withQuery } from "@/lib/api";
import noRecordsImage from "@/assets/no_records.png";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dateFilterParams, getDefaultGridProps } from "@/lib/agGridUtils";

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

type ReportType =
  | "product_stock"
  | "order_product_transaction"
  | "order_tray_transaction"
  | "tray_transaction"
  | "rack_transaction"
  | "order_failure_transaction";

// Format date as YYYY-MM-DD HH:mm (matching Python logic)
const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return "";
  try {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return value;
  }
};

const Reports = () => {
  useAuthSession();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const robotId = searchParams.get("robot_id") || "AMSSTORES1-Nano";

  const [reportType, setReportType] = useState<ReportType>("product_stock");
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const gridApiRef = useRef<any>(null);

  const reportLabels: Record<ReportType, string> = {
    product_stock: "Product Stock Report",
    order_product_transaction: "Order Product Transaction",
    order_tray_transaction: "Order Tray Transaction",
    tray_transaction: "Tray Transaction",
    rack_transaction: "Rack Transaction",
    order_failure_transaction: "Order Failure Transaction",
  };

  // Product Stock Report columns (matching Python: Transaction Date, Receive Date, Item Id, Stock, Tray ID, Tray Weight (kg), Item Description)
  const productStockColumns: ColDef[] = [
    {
      field: "transaction_date",
      headerName: "Transaction Date",
      flex: 1,
      minWidth: 150,
      filter: "agDateColumnFilter",
      filterParams: dateFilterParams,
    },
    {
      field: "receive_date",
      headerName: "Receive Date",
      flex: 1,
      minWidth: 120,
      filter: "agDateColumnFilter",
      filterParams: dateFilterParams,
    },
    { field: "item_id", headerName: "Item Id", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "stock", headerName: "Stock", flex: 0.7, minWidth: 80, valueFormatter: (p) => p.value ?? 0 },
    { field: "tray_id", headerName: "Tray ID", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "tray_weight_kg",
      headerName: "Tray Weight (kg)",
      flex: 1,
      minWidth: 130,
      valueFormatter: (p) => p.value ?? "N/A",
    },
    {
      field: "item_description",
      headerName: "Item Description",
      flex: 1.5,
      minWidth: 200,
      valueFormatter: (p) => p.value ?? "N/A",
    },
  ];

  // Order Product Transaction columns (matching Python: Transaction Date, Activity Type, Order Id, User Id, User Name, User Phone, Tray ID, Item Id, Item Processed Qty)
  const orderProductColumns: ColDef[] = [
    {
      field: "transaction_date",
      headerName: "Transaction Date",
      flex: 1,
      minWidth: 150,
      filter: "agDateColumnFilter",
      filterParams: dateFilterParams,
    },
    {
      field: "activity_type",
      headerName: "Activity Type",
      flex: 0.8,
      minWidth: 110,
      valueFormatter: (p) => p.value ?? "N/A",
    },
    { field: "order_id", headerName: "Order Id", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "user_id", headerName: "User Id", flex: 0.8, minWidth: 100, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "user_name", headerName: "User Name", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "user_phone", headerName: "User Phone", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "tray_id", headerName: "Tray ID", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "item_id", headerName: "Item Id", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "item_processed_qty",
      headerName: "Item Processed Qty",
      flex: 1,
      minWidth: 150,
      valueFormatter: (p) => p.value ?? 0,
    },
    {
      field: "order_external_reference",
      headerName: "Order External Reference",
      flex: 1,
      minWidth: 180,
      valueFormatter: (p) => p.value ?? "N/A",
    },
  ];

  // Order Tray Transaction columns (matching Python: Transaction Date, Order Id, Status, Tray ID, Station, Item Id, Item Order Qty, Order Ref Id)
  const orderTrayColumns: ColDef[] = [
    {
      field: "transaction_date",
      headerName: "Transaction Date",
      flex: 1,
      minWidth: 150,
      filter: "agDateColumnFilter",
      filterParams: dateFilterParams,
    },
    { field: "order_id", headerName: "Order Id", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "status", headerName: "Status", flex: 0.8, minWidth: 100, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "tray_id", headerName: "Tray ID", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "station", headerName: "Station", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "item_id", headerName: "Item Id", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "item_order_qty",
      headerName: "Item Order Qty",
      flex: 1,
      minWidth: 130,
      valueFormatter: (p) => p.value ?? 0,
    },
    {
      field: "order_ref_id",
      headerName: "Order Ref Id",
      flex: 1,
      minWidth: 120,
      valueFormatter: (p) => p.value ?? "N/A",
    },
  ];

  // Tray Transaction columns (matching Python: Transaction Date, Tray ID, Tray Status, Division, Tray Weight (kg), Tray Height, Number of Items, Total Available Quantity, Has Item)
  const trayTransactionColumns: ColDef[] = [
    {
      field: "transaction_date",
      headerName: "Transaction Date",
      flex: 1,
      minWidth: 150,
      filter: "agDateColumnFilter",
      filterParams: dateFilterParams,
    },
    { field: "tray_id", headerName: "Tray ID", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "tray_status",
      headerName: "Tray Status",
      flex: 0.8,
      minWidth: 100,
      valueFormatter: (p) => p.value ?? "N/A",
    },
    { field: "division", headerName: "Division", flex: 0.7, minWidth: 90, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "tray_weight_kg",
      headerName: "Tray Weight (kg)",
      flex: 1,
      minWidth: 130,
      valueFormatter: (p) => p.value ?? "N/A",
    },
    {
      field: "tray_height",
      headerName: "Tray Height",
      flex: 0.8,
      minWidth: 100,
      valueFormatter: (p) => p.value ?? "N/A",
    },
    {
      field: "number_of_items",
      headerName: "Number of Items",
      flex: 1,
      minWidth: 130,
      valueFormatter: (p) => p.value ?? 0,
    },
    {
      field: "total_available_quantity",
      headerName: "Total Available Quantity",
      flex: 1,
      minWidth: 170,
      valueFormatter: (p) => p.value ?? 0,
    },
    {
      field: "has_item",
      headerName: "Has Item",
      flex: 0.7,
      minWidth: 90,
      valueFormatter: (p) => (p.value ? "Yes" : "No"),
    },
  ];

  // Rack Transaction columns (matching Python: Transaction Date, Rack, Occupied Slots, Free Slots, Rack Occupancy in %)
  const rackTransactionColumns: ColDef[] = [
    {
      field: "transaction_date",
      headerName: "Transaction Date",
      flex: 1,
      minWidth: 150,
      filter: "agDateColumnFilter",
      filterParams: dateFilterParams,
    },
    { field: "rack", headerName: "Rack", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "occupied_slots",
      headerName: "Occupied Slots",
      flex: 1,
      minWidth: 130,
      valueFormatter: (p) => p.value ?? 0,
    },
    { field: "free_slots", headerName: "Free Slots", flex: 1, minWidth: 100, valueFormatter: (p) => p.value ?? 0 },
    {
      field: "rack_occupancy_percent",
      headerName: "Rack Occupancy in %",
      flex: 1,
      minWidth: 160,
      valueFormatter: (p) => (p.value !== undefined ? `${Number(p.value).toFixed(2)}` : "N/A"),
    },
  ];

  // Order Failure Transaction columns (matching Python: Transaction Date, Order Ref ID, Activity, Item ID, Movement Type, Order Type, Item Order Qty, Message)
  const orderFailureColumns: ColDef[] = [
    {
      field: "transaction_date",
      headerName: "Transaction Date",
      flex: 1,
      minWidth: 150,
      filter: "agDateColumnFilter",
      filterParams: dateFilterParams,
    },
    {
      field: "order_ref_id",
      headerName: "Order Ref ID",
      flex: 1,
      minWidth: 120,
      valueFormatter: (p) => p.value ?? "N/A",
    },
    { field: "activity", headerName: "Activity", flex: 0.8, minWidth: 100, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "item_id", headerName: "Item ID", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "movement_type",
      headerName: "Movement Type",
      flex: 1,
      minWidth: 130,
      valueFormatter: (p) => p.value ?? "N/A",
    },
    {
      field: "order_type",
      headerName: "Order Type",
      flex: 0.8,
      minWidth: 110,
      valueFormatter: (p) => p.value ?? "N/A",
    },
    {
      field: "item_order_qty",
      headerName: "Item Order Qty",
      flex: 1,
      minWidth: 130,
      valueFormatter: (p) => p.value ?? 0,
    },
    { field: "message", headerName: "Message", flex: 1.5, minWidth: 200, valueFormatter: (p) => p.value ?? "N/A" },
  ];

  const getColumnsForReport = (type: ReportType): ColDef[] => {
    switch (type) {
      case "product_stock":
        return productStockColumns;
      case "order_product_transaction":
        return orderProductColumns;
      case "order_tray_transaction":
        return orderTrayColumns;
      case "tray_transaction":
        return trayTransactionColumns;
      case "rack_transaction":
        return rackTransactionColumns;
      case "order_failure_transaction":
        return orderFailureColumns;
      default:
        return productStockColumns;
    }
  };

  // Fetch Product Stock Report (matching Python get_stocks_products)
  const fetchProductStock = async (): Promise<any[]> => {
    const params = {
      has_item: "True",
      num_records: "100000000",
      order_by_field: "updated_at",
      order_by_type: "DESC",
    };
    const url = withQuery(`${NANOSTORE_BASE}/trays_for_order`, params);
    const { data } = await apiGet<any>(url);

    if (data.status === "success" && data.count !== 0) {
      return (data.records || []).map((item: any) => ({
        transaction_date: formatDateTime(item.updated_at),
        receive_date: item.inbound_date || "",
        item_id: item.item_id,
        stock: item.available_quantity,
        tray_id: item.tray_id,
        tray_weight_kg: item.tray_weight ? (parseFloat(item.tray_weight) / 1000).toFixed(3) : "",
        item_description: item.item_description,
      }));
    }
    return [];
  };

  // Fetch Order Product Transaction (matching Python get_ProductTransactionHistory)
  const fetchOrderProductTransaction = async (): Promise<any[]> => {
    const params = {
      num_records: "100000000",
      order_by_field: "updated_at",
      order_by_type: "DESC",
    };
    const url = withQuery(`${NANOSTORE_BASE}/transactions`, params);
    const { data } = await apiGet<any>(url);

    if (data.status === "success") {
      return (data.records || []).map((item: any) => ({
        transaction_date: formatDateTime(item.updated_at),
        activity_type: item.order_type,
        order_id: item.order_id,
        user_id: item.user_id,
        user_name: item.user_name,
        user_phone: item.user_phone,
        tray_id: item.tray_id,
        item_id: item.item_id,
        item_processed_qty: item.transaction_item_quantity,
        order_external_reference: item.order_external_reference,
      }));
    }
    return [];
  };

  // Fetch Order Tray Transaction (matching Python get_order_trays_transaction)
  const fetchOrderTrayTransaction = async (): Promise<any[]> => {
    const params = {
      num_records: "100000000",
      order_by_field: "updated_at",
      order_by_type: "DESC",
    };
    const url = withQuery(`${NANOSTORE_BASE}/orders`, params);
    const { data } = await apiGet<any>(url);

    if (data.status === "success") {
      return (data.records || []).map((item: any) => ({
        transaction_date: formatDateTime(item.updated_at),
        order_id: item.id,
        status: item.tray_status,
        tray_id: item.tray_id,
        station: item.station_id,
        item_id: item.item_id,
        item_order_qty: item.quantity,
        order_ref_id: item.order_ref,
      }));
    }
    return [];
  };

  // Fetch Tray Transaction (matching Python get_trayTransactionHistory with grouping)
  const fetchTrayTransaction = async (): Promise<any[]> => {
    const params = {
      num_records: "100000000",
      order_by_field: "updated_at",
      order_by_type: "DESC",
    };
    const url = withQuery(`${NANOSTORE_BASE}/trays_for_order`, params);
    const { data } = await apiGet<any>(url);

    if (data.status === "success") {
      const records = data.records || [];

      // Group by tray_id (matching Python logic)
      const trayMap: Record<string, any> = {};
      const trayItemsMap: Record<string, Set<string>> = {};
      const trayQuantityMap: Record<string, number> = {};

      for (const item of records) {
        const trayId = item.tray_id || "";
        const itemId = item.item_id || "";
        const availableQty = item.available_quantity || 0;

        if (!trayMap[trayId]) {
          trayMap[trayId] = {
            transaction_date: formatDateTime(item.updated_at),
            tray_id: trayId,
            tray_status: item.tray_status,
            division: item.division,
            tray_weight_kg: item.tray_weight ? (parseFloat(item.tray_weight) / 1000).toFixed(3) : "",
            tray_height: item.tray_height,
            number_of_items: 0,
            total_available_quantity: 0,
          };
          trayItemsMap[trayId] = new Set();
          trayQuantityMap[trayId] = 0;
        }

        if (itemId) {
          trayItemsMap[trayId].add(itemId);
        }
        trayQuantityMap[trayId] += availableQty;
      }

      // Build final result
      return Object.entries(trayMap).map(([trayId, trayData]) => {
        const totalQty = trayQuantityMap[trayId];
        return {
          ...trayData,
          number_of_items: trayItemsMap[trayId].size,
          total_available_quantity: totalQty,
          has_item: totalQty > 0,
        };
      });
    }
    return [];
  };

  // Fetch Rack Transaction (matching Python get_robotTransactionHistory)
  const fetchRackTransaction = async (): Promise<any[]> => {
    // First get robot info to know total racks and slots per rack
    const robotUrl = `${ROBOTMANAGER_BASE}/robots`;
    const { data: robotData } = await apiGet<any>(robotUrl);

    if (robotData.status !== "success" || !robotData.records?.length) {
      return [];
    }

    const robot = robotData.records[0];
    const totalRacks = robot.robot_num_racks || 0;
    const robotNumRows = robot.robot_num_rows || 1;
    const robotNumSlots = robot.robot_num_slots || 1;
    const robotNumDepths = robot.robot_num_depths || 1;
    const totalSlotsPerRack = robotNumSlots * robotNumRows * robotNumDepths;

    const results: any[] = [];
    const currentDateTime = formatDateTime(new Date().toISOString());

    // Fetch slots for each rack
    for (let rack = 0; rack < totalRacks; rack++) {
      const slotsUrl = withQuery(`${ROBOTMANAGER_BASE}/slots`, { rack: rack.toString() });
      const { data: slotsData } = await apiGet<any>(slotsUrl);

      let occupiedSlots = 0;
      if (slotsData.status === "success" && slotsData.count !== 0) {
        for (const slot of slotsData.records || []) {
          if (slot.tray_id !== null) {
            occupiedSlots++;
          }
        }
      }

      const freeSlots = totalSlotsPerRack - occupiedSlots;
      const occupancyPercent = totalSlotsPerRack > 0 ? (occupiedSlots / totalSlotsPerRack) * 100 : 0;

      results.push({
        transaction_date: currentDateTime,
        rack: `Rack ${rack}`,
        occupied_slots: occupiedSlots,
        free_slots: freeSlots,
        rack_occupancy_percent: occupancyPercent.toFixed(2),
      });
    }

    return results;
  };

  // Fetch Order Failure Transaction (matching Python get_order_failure_transaction)
  const fetchOrderFailureTransaction = async (): Promise<any[]> => {
    const params = {
      num_records: "100000000",
    };
    const url = withQuery(`${NANOSTORE_BASE}/order_failure`, params);
    const { data } = await apiGet<any>(url);

    if (data.status === "success") {
      return (data.records || []).map((item: any) => ({
        transaction_date: formatDateTime(item.updated_at),
        order_ref_id: item.order_ref,
        activity: item.activity,
        item_id: item.item_id,
        movement_type: item.station_id,
        order_type: item.order_type,
        item_order_qty: item.quantity,
        message: item.message,
      }));
    }
    return [];
  };


  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      let records: any[] = [];

      switch (reportType) {
        case "product_stock":
          records = await fetchProductStock();
          break;
        case "order_product_transaction":
          records = await fetchOrderProductTransaction();
          break;
        case "order_tray_transaction":
          records = await fetchOrderTrayTransaction();
          break;
        case "tray_transaction":
          records = await fetchTrayTransaction();
          break;
        case "rack_transaction":
          records = await fetchRackTransaction();
          break;
        case "order_failure_transaction":
          records = await fetchOrderFailureTransaction();
          break;
        default:
          records = [];
      }

      setRowData(records);
    } catch (error) {
      if (error instanceof Error && error.message === "AUTH_TOKEN_MISSING") {
        toast({
          title: "Session Expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
      console.error("Error fetching report data:", error);
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [reportType, toast, navigate]);

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleRefresh = () => {
    fetchReportData();
  };

  const handleDownload = () => {
    if (rowData.length === 0) {
      toast({ title: "No Data", description: "No data available to download", variant: "destructive" });
      return;
    }

    const columns = getColumnsForReport(reportType);
    const headers = columns.map((col) => col.headerName).join(",");
    const rows = rowData
      .map((row) =>
        columns
          .map((col) => {
            const field = col.field as string;
            let value = row[field];
            if (field === "has_item") {
              value = value ? "Yes" : "No";
            }
            return `"${value ?? "N/A"}"`;
          })
          .join(","),
      )
      .join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportLabels[reportType].replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fafafa" }}>
      <AppHeader selectedTab="reports" isReportsPage={true} />

      <main className="p-2 sm:p-4">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
            <SelectTrigger className="w-[280px] bg-white">
              <SelectValue placeholder="Select Report" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(reportLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={rowData.length === 0}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>

        {/* AG Grid Table */}
        {!loading && rowData.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 180px)" }}>
            <img src={noRecordsImage} alt="No Record found" className="w-48 sm:w-[340px]" />
          </div>
        ) : (
          <div className="ag-theme-quartz w-full" style={{ height: "calc(100vh - 145px)" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={getColumnsForReport(reportType)}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
                minWidth: 80,
              }}
              animateRows={true}
              pagination={true}
              paginationPageSize={50}
              paginationPageSizeSelector={[25, 50, 100, 200]}
              rowHeight={35}
              {...getDefaultGridProps()}
              onGridReady={(params) => {
                gridApiRef.current = params.api;
                params.api.sizeColumnsToFit();
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;
