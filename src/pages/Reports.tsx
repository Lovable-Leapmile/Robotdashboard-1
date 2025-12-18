import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import noRecordsImage from "@/assets/no_records.png";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

const AUTH_TOKEN =
  "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc";

type ReportType =
  | "product_stock"
  | "order_product_transaction"
  | "order_tray_transaction"
  | "tray_transaction"
  | "rack_transaction"
  | "order_failure_transaction";

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return "N/A";
  try {
    return format(new Date(value), "dd-MM-yyyy HH:mm:ss");
  } catch {
    return value;
  }
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return "N/A";
  try {
    return format(new Date(value), "dd-MM-yyyy");
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
  const [occupiedPercent, setOccupiedPercent] = useState(0);
  const gridApiRef = useRef<any>(null);

  const reportLabels: Record<ReportType, string> = {
    product_stock: "Product Stock Report",
    order_product_transaction: "Order Product Transaction",
    order_tray_transaction: "Order Tray Transaction",
    tray_transaction: "Tray Transaction",
    rack_transaction: "Rack Transaction",
    order_failure_transaction: "Order Failure Transaction",
  };

  // Product Stock Report: Transaction Date, Receive Date, Item Id, Stock, Tray ID, Tray Weight(Kg), Item Description
  const productStockColumns: ColDef[] = [
    {
      field: "updated_at",
      headerName: "Transaction Date",
      flex: 1,
      minWidth: 150,
      valueFormatter: (p) => formatDateTime(p.value),
    },
    {
      field: "created_at",
      headerName: "Receive Date",
      flex: 1,
      minWidth: 120,
      valueFormatter: (p) => formatDate(p.value),
    },
    { field: "item_id", headerName: "Item Id", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "item_quantity", headerName: "Stock", flex: 0.7, minWidth: 80, valueFormatter: (p) => p.value ?? 0 },
    { field: "tray_id", headerName: "Tray ID", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "tray_weight",
      headerName: "Tray Weight(Kg)",
      flex: 1,
      minWidth: 130,
      valueFormatter: (p) => (p.value ? (p.value / 1000).toFixed(2) : "N/A"),
    },
    {
      field: "item_description",
      headerName: "Item Description",
      flex: 1.5,
      minWidth: 200,
      valueFormatter: (p) => p.value ?? "N/A",
    },
  ];

  // Order Product Transaction: Transaction Date, Activity Type, Order Id, User Id, User Name, User Phone, Tray ID, Item Id, Item Processed Quantity
  const orderProductColumns: ColDef[] = [
    {
      field: "updated_at",
      headerName: "Transaction Date",
      flex: 1,
      minWidth: 150,
      valueFormatter: (p) => formatDateTime(p.value),
    },
    {
      field: "transaction_type",
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
      field: "picked_count",
      headerName: "Item Processed Quantity",
      flex: 1,
      minWidth: 170,
      valueFormatter: (p) => p.value ?? 0,
    },
  ];

  // Order Tray Transaction: Transaction Date, Order Id, Status, Tray ID, Station, Item Id, Item Order Quantity, Order Ref Id
  const orderTrayColumns: ColDef[] = [
    {
      field: "created_at",
      headerName: "Transaction Date",
      flex: 1,
      minWidth: 150,
      valueFormatter: (p) => formatDateTime(p.value),
    },
    { field: "order_id", headerName: "Order Id", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "status", headerName: "Status", flex: 0.8, minWidth: 100, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "tray_id", headerName: "Tray ID", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "station_name", headerName: "Station", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "item_id", headerName: "Item Id", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "item_order_quantity",
      headerName: "Item Order Quantity",
      flex: 1,
      minWidth: 150,
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

  // Tray Transaction: Transaction Date, Tray Id, Tray Status, Division, Tray Weight(Kg), Tray Height, Number of Items, Total Available Quantity, Has Item
  const trayTransactionColumns: ColDef[] = [
    {
      field: "updated_at",
      headerName: "Transaction Date",
      flex: 1,
      minWidth: 150,
      valueFormatter: (p) => formatDateTime(p.value),
    },
    { field: "tray_id", headerName: "Tray Id", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "tray_status",
      headerName: "Tray Status",
      flex: 0.8,
      minWidth: 100,
      valueFormatter: (p) => p.value ?? "N/A",
    },
    { field: "tray_divider", headerName: "Division", flex: 0.7, minWidth: 90, valueFormatter: (p) => p.value ?? 0 },
    {
      field: "tray_weight",
      headerName: "Tray Weight(Kg)",
      flex: 1,
      minWidth: 130,
      valueFormatter: (p) => (p.value ? (p.value / 1000).toFixed(2) : "N/A"),
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

  // Rack Transaction: Transaction Date, Rack, Occupied Slots, Free Slots, Rack Occupancy In %
  const rackTransactionColumns: ColDef[] = [
    {
      field: "updated_at",
      headerName: "Transaction Date",
      flex: 1,
      minWidth: 150,
      valueFormatter: (p) => formatDateTime(p.value),
    },
    { field: "rack_name", headerName: "Rack", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
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
      headerName: "Rack Occupancy In %",
      flex: 1,
      minWidth: 160,
      valueFormatter: (p) => (p.value !== undefined ? `${Number(p.value).toFixed(2)}%` : "N/A"),
    },
  ];

  // Order Failure Transaction: Transaction Date, Order Id, Activity, Item ID, Movement Type, Order Type, Item Order Quantity, Message
  const orderFailureColumns: ColDef[] = [
    {
      field: "created_at",
      headerName: "Transaction Date",
      flex: 1,
      minWidth: 150,
      valueFormatter: (p) => formatDateTime(p.value),
    },
    { field: "order_id", headerName: "Order Id", flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
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
      field: "item_order_quantity",
      headerName: "Item Order Quantity",
      flex: 1,
      minWidth: 150,
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

  const getEndpointForReport = (type: ReportType): string => {
    switch (type) {
      case "product_stock":
        return "https://amsstores1.leapmile.com/nanostore/items";
      case "order_product_transaction":
        return "https://amsstores1.leapmile.com/nanostore/items/usage?order_by=DESC";
      case "order_tray_transaction":
        return "https://amsstores1.leapmile.com/robotmanager/task";
      case "tray_transaction":
        return "https://amsstores1.leapmile.com/robotmanager/trays";
      case "rack_transaction":
        return "https://amsstores1.leapmile.com/robotmanager/slots";
      case "order_failure_transaction":
        return "https://amsstores1.leapmile.com/robotmanager/task?task_status=failed";
      default:
        return "https://amsstores1.leapmile.com/nanostore/items";
    }
  };

  const aggregateSlotsByRack = (slots: any[]) => {
    const rackMap: Record<string, { total: number; occupied: number; updated_at: string }> = {};

    slots.forEach((slot) => {
      // Extract rack name from slot_id (e.g., "R01-C01-L01" -> "R01")
      const rackName = slot.slot_id?.split("-")[0] || slot.rack_name || "Unknown";
      if (!rackMap[rackName]) {
        rackMap[rackName] = { total: 0, occupied: 0, updated_at: slot.updated_at || "" };
      }
      rackMap[rackName].total++;
      if (slot.tray_id) {
        rackMap[rackName].occupied++;
      }
      if (slot.updated_at && slot.updated_at > rackMap[rackName].updated_at) {
        rackMap[rackName].updated_at = slot.updated_at;
      }
    });

    return Object.entries(rackMap)
      .map(([rackName, data]) => ({
        rack_name: rackName,
        occupied_slots: data.occupied,
        free_slots: data.total - data.occupied,
        rack_occupancy_percent: data.total > 0 ? (data.occupied / data.total) * 100 : 0,
        updated_at: data.updated_at,
      }))
      .sort((a, b) => a.rack_name.localeCompare(b.rack_name));
  };

  const fetchOccupiedPercent = useCallback(async () => {
    try {
      const [slotsResponse, traysResponse] = await Promise.all([
        fetch("https://amsstores1.leapmile.com/robotmanager/slots_count?slot_status=active", {
          headers: { Authorization: AUTH_TOKEN, "Content-Type": "application/json" },
        }),
        fetch("https://amsstores1.leapmile.com/robotmanager/trays?tray_status=active", {
          headers: { Authorization: AUTH_TOKEN, "Content-Type": "application/json" },
        }),
      ]);

      const slotsData = await slotsResponse.json();
      const traysData = await traysResponse.json();

      const totalSlots = slotsData.records?.[0]?.total_count || 0;
      const occupiedSlots = traysData.records ? traysData.records.length : 0;
      const percent = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

      setOccupiedPercent(percent);
    } catch (error) {
      console.error("Error fetching occupied percent:", error);
    }
  }, []);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = getEndpointForReport(reportType);

      const response = await fetch(endpoint, {
        headers: { Authorization: AUTH_TOKEN, "Content-Type": "application/json" },
      });

      if (response.status === 404) {
        setRowData([]);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let records = data.records || [];

      // For rack transaction, aggregate slots by rack
      if (reportType === "rack_transaction") {
        records = aggregateSlotsByRack(records);
      }

      // For tray transaction, add computed fields
      if (reportType === "tray_transaction") {
        records = records.map((r: any) => ({
          ...r,
          has_item: r.tray_lockcount > 0 || r.number_of_items > 0,
        }));
      }

      console.log(`Fetched ${reportType}:`, records.length);
      setRowData(records);
    } catch (error) {
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
  }, [reportType, toast]);

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    fetchOccupiedPercent();
  }, [navigate, fetchOccupiedPercent]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleRefresh = () => {
    fetchReportData();
    fetchOccupiedPercent();
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
            if (field.includes("_at")) {
              value = value ? formatDateTime(value) : "N/A";
            }
            if (field === "tray_weight") {
              value = value ? (value / 1000).toFixed(2) : "N/A";
            }
            if (field === "rack_occupancy_percent") {
              value = value !== undefined ? `${Number(value).toFixed(2)}%` : "N/A";
            }
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
              <SelectTrigger className="w-full sm:w-[280px] bg-white border-gray-300">
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 z-50">
                <SelectItem value="product_stock">Product Stock Report</SelectItem>
                <SelectItem value="order_product_transaction">Order Product Transaction</SelectItem>
                <SelectItem value="order_tray_transaction">Order Tray Transaction</SelectItem>
                <SelectItem value="tray_transaction">Tray Transaction</SelectItem>
                <SelectItem value="rack_transaction">Rack Transaction</SelectItem>
                <SelectItem value="order_failure_transaction">Order Failure Transaction</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-blue-50 px-3 py-1.5 rounded text-sm">
              Occupied: <span className="font-semibold text-blue-600">{occupiedPercent.toFixed(1)}%</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="bg-white">
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={loading || rowData.length === 0}
              className="bg-white"
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
          </div>
        </div>

        {/* Data Grid */}
        {!loading && rowData.length === 0 ? (
          <div className="flex justify-center items-center" style={{ height: "calc(100vh - 145px)" }}>
            <img src={noRecordsImage} alt="No records found" className="w-48 sm:w-[340px]" />
          </div>
        ) : (
          <div className="ag-theme-quartz w-full" style={{ height: "calc(100vh - 180px)" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={getColumnsForReport(reportType)}
              defaultColDef={{
                resizable: true,
                minWidth: 100,
                sortable: true,
                filter: true,
              }}
              pagination={true}
              paginationPageSize={50}
              paginationPageSizeSelector={[25, 50, 100, 200]}
              rowHeight={35}
              enableCellTextSelection={true}
              ensureDomOrder={true}
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
