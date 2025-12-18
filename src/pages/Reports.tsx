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

  // Product Stock Report columns - uses /nanostore/stock endpoint
  // Fields: Transaction Date, Receive Date, Item Id, Stock, Tray ID, Tray Weight(Kg), Item Description
  const productStockColumns: ColDef[] = [
    {
      field: "updated_at",
      headerName: "Transaction Date",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 150,
      valueFormatter: (p) => formatDateTime(p.value),
    },
    {
      field: "created_at",
      headerName: "Receive Date",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      valueFormatter: (p) => formatDate(p.value),
    },
    { field: "item_id", headerName: "Item Id", sortable: true, filter: true, flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "item_quantity", headerName: "Stock", sortable: true, filter: true, flex: 0.7, minWidth: 80, valueFormatter: (p) => p.value ?? 0 },
    { field: "tray_id", headerName: "Tray ID", sortable: true, filter: true, flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "tray_weight",
      headerName: "Tray Weight(Kg)",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 130,
      valueFormatter: (p) => (p.value ? (p.value / 1000).toFixed(2) : "N/A"),
    },
    {
      field: "item_description",
      headerName: "Item Description",
      sortable: true,
      filter: true,
      flex: 1.5,
      minWidth: 200,
      valueFormatter: (p) => p.value ?? "N/A",
    },
  ];

  // Order Product Transaction columns - uses /nanostore/items/usage endpoint
  // Fields: Transaction Date, Activity Type, Order Id, User Id, User Name, User Phone, Tray ID, Item Id, Item Processed Quantity
  const orderProductColumns: ColDef[] = [
    {
      field: "updated_at",
      headerName: "Transaction Date",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 150,
      valueFormatter: (p) => formatDateTime(p.value),
    },
    {
      field: "transaction_type",
      headerName: "Activity Type",
      sortable: true,
      filter: true,
      flex: 0.8,
      minWidth: 110,
      valueFormatter: (p) => p.value ?? "N/A",
    },
    { field: "order_id", headerName: "Order Id", sortable: true, filter: true, flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "user_id", headerName: "User Id", sortable: true, filter: true, flex: 0.8, minWidth: 100, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "user_name", headerName: "User Name", sortable: true, filter: true, flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "user_phone", headerName: "User Phone", sortable: true, filter: true, flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "tray_id", headerName: "Tray ID", sortable: true, filter: true, flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "item_id", headerName: "Item Id", sortable: true, filter: true, flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "picked_count",
      headerName: "Item Processed Quantity",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 170,
      valueFormatter: (p) => p.value ?? 0,
    },
  ];

  // Order Tray Transaction columns - uses /robotmanager/task endpoint
  // Fields: Transaction Date, Order Id, Status, Tray ID, Station, Item Id, Item Order Quantity, Order Ref Id
  const orderTrayColumns: ColDef[] = [
    {
      field: "created_at",
      headerName: "Transaction Date",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 150,
      valueFormatter: (p) => formatDateTime(p.value),
    },
    { field: "order_id", headerName: "Order Id", sortable: true, filter: true, flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "status", headerName: "Status", sortable: true, filter: true, flex: 0.8, minWidth: 100, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "tray_id", headerName: "Tray ID", sortable: true, filter: true, flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "station_name", headerName: "Station", sortable: true, filter: true, flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "item_id", headerName: "Item Id", sortable: true, filter: true, flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "item_order_quantity",
      headerName: "Item Order Quantity",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 150,
      valueFormatter: (p) => p.value ?? 0,
    },
    {
      field: "order_ref_id",
      headerName: "Order Ref Id",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      valueFormatter: (p) => p.value ?? "N/A",
    },
  ];

  // Tray Transaction columns - uses /robotmanager/trays endpoint
  // Fields: Transaction Date, Tray Id, Tray Status, Division, Tray Weight(Kg), Tray Height, Number of Items, Total Available Quantity, Has Item
  const trayTransactionColumns: ColDef[] = [
    {
      field: "updated_at",
      headerName: "Transaction Date",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 150,
      valueFormatter: (p) => formatDateTime(p.value),
    },
    { field: "tray_id", headerName: "Tray Id", sortable: true, filter: true, flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "tray_status",
      headerName: "Tray Status",
      sortable: true,
      filter: true,
      flex: 0.8,
      minWidth: 100,
      valueFormatter: (p) => p.value ?? "N/A",
    },
    { field: "tray_divider", headerName: "Division", sortable: true, filter: true, flex: 0.7, minWidth: 90, valueFormatter: (p) => p.value ?? 0 },
    {
      field: "tray_weight",
      headerName: "Tray Weight(Kg)",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 130,
      valueFormatter: (p) => (p.value ? (p.value / 1000).toFixed(2) : "N/A"),
    },
    {
      field: "tray_height",
      headerName: "Tray Height",
      sortable: true,
      filter: true,
      flex: 0.8,
      minWidth: 100,
      valueFormatter: (p) => p.value ?? "N/A",
    },
    {
      field: "number_of_items",
      headerName: "Number of Items",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 130,
      valueFormatter: (p) => p.value ?? 0,
    },
    {
      field: "total_available_quantity",
      headerName: "Total Available Quantity",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 170,
      valueFormatter: (p) => p.value ?? 0,
    },
    {
      field: "has_item",
      headerName: "Has Item",
      sortable: true,
      filter: true,
      flex: 0.7,
      minWidth: 90,
      valueFormatter: (p) => (p.value ? "Yes" : "No"),
    },
  ];

  // Rack Transaction columns - aggregated from /robotmanager/slots endpoint
  // Fields: Transaction Date, Rack, Occupied Slots, Free Slots, Rack Occupancy In %
  const rackTransactionColumns: ColDef[] = [
    {
      field: "updated_at",
      headerName: "Transaction Date",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 150,
      valueFormatter: (p) => formatDateTime(p.value),
    },
    { field: "rack_name", headerName: "Rack", sortable: true, filter: true, flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "occupied_slots",
      headerName: "Occupied Slots",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 130,
      valueFormatter: (p) => p.value ?? 0,
    },
    { field: "free_slots", headerName: "Free Slots", sortable: true, filter: true, flex: 1, minWidth: 100, valueFormatter: (p) => p.value ?? 0 },
    {
      field: "rack_occupancy_percent",
      headerName: "Rack Occupancy In %",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 160,
      valueFormatter: (p) => (p.value !== undefined ? `${Number(p.value).toFixed(2)}%` : "N/A"),
    },
  ];

  // Order Failure Transaction columns - uses /robotmanager/task?task_status=failed endpoint
  // Fields: Transaction Date, Order Id, Activity, Item ID, Movement Type, Order Type, Item Order Quantity, Message
  const orderFailureColumns: ColDef[] = [
    {
      field: "created_at",
      headerName: "Transaction Date",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 150,
      valueFormatter: (p) => formatDateTime(p.value),
    },
    { field: "order_id", headerName: "Order Id", sortable: true, filter: true, flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "activity", headerName: "Activity", sortable: true, filter: true, flex: 0.8, minWidth: 100, valueFormatter: (p) => p.value ?? "N/A" },
    { field: "item_id", headerName: "Item ID", sortable: true, filter: true, flex: 1, minWidth: 120, valueFormatter: (p) => p.value ?? "N/A" },
    {
      field: "movement_type",
      headerName: "Movement Type",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 130,
      valueFormatter: (p) => p.value ?? "N/A",
    },
    {
      field: "order_type",
      headerName: "Order Type",
      sortable: true,
      filter: true,
      flex: 0.8,
      minWidth: 110,
      valueFormatter: (p) => p.value ?? "N/A",
    },
    {
      field: "item_order_quantity",
      headerName: "Item Order Quantity",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 150,
      valueFormatter: (p) => p.value ?? 0,
    },
    { field: "message", headerName: "Message", sortable: true, filter: true, flex: 1.5, minWidth: 200, valueFormatter: (p) => p.value ?? "N/A" },
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

  // Aggregate slots by rack for Rack Transaction report
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
      let records: any[] = [];

      switch (reportType) {
        case "product_stock": {
          // Fetch from /nanostore/stock for product stock report
          const response = await fetch("https://amsstores1.leapmile.com/nanostore/stock", {
            headers: { Authorization: AUTH_TOKEN, "Content-Type": "application/json" },
          });
          if (response.ok) {
            const data = await response.json();
            records = data.records || [];
          }
          break;
        }

        case "order_product_transaction": {
          // Fetch from /nanostore/items/usage for order product transaction
          const response = await fetch("https://amsstores1.leapmile.com/nanostore/items/usage?order_by=DESC", {
            headers: { Authorization: AUTH_TOKEN, "Content-Type": "application/json" },
          });
          if (response.ok) {
            const data = await response.json();
            records = data.records || [];
          }
          break;
        }

        case "order_tray_transaction": {
          // Fetch from /robotmanager/task for order tray transaction
          const response = await fetch("https://amsstores1.leapmile.com/robotmanager/task", {
            headers: { Authorization: AUTH_TOKEN, "Content-Type": "application/json" },
          });
          if (response.ok) {
            const data = await response.json();
            records = data.records || [];
          }
          break;
        }

        case "tray_transaction": {
          // Fetch from /robotmanager/trays for tray transaction
          const response = await fetch("https://amsstores1.leapmile.com/robotmanager/trays", {
            headers: { Authorization: AUTH_TOKEN, "Content-Type": "application/json" },
          });
          if (response.ok) {
            const data = await response.json();
            // Add computed has_item field based on tray_lockcount
            records = (data.records || []).map((r: any) => ({
              ...r,
              has_item: r.tray_lockcount > 0 || (r.number_of_items && r.number_of_items > 0),
              number_of_items: r.number_of_items ?? 0,
              total_available_quantity: r.total_available_quantity ?? 0,
            }));
          }
          break;
        }

        case "rack_transaction": {
          // Fetch from /robotmanager/slots and aggregate by rack
          const response = await fetch("https://amsstores1.leapmile.com/robotmanager/slots", {
            headers: { Authorization: AUTH_TOKEN, "Content-Type": "application/json" },
          });
          if (response.ok) {
            const data = await response.json();
            records = aggregateSlotsByRack(data.records || []);
          }
          break;
        }

        case "order_failure_transaction": {
          // Fetch from /robotmanager/task?task_status=failed for failure transactions
          const response = await fetch("https://amsstores1.leapmile.com/robotmanager/task?task_status=failed", {
            headers: { Authorization: AUTH_TOKEN, "Content-Type": "application/json" },
          });
          if (response.ok) {
            const data = await response.json();
            records = data.records || [];
          }
          break;
        }
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
              <SelectTrigger className="w-full sm:w-[280px] bg-card border-border">
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {Object.entries(reportLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={rowData.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>

        {/* AG Grid Table */}
        <div
          className="ag-theme-quartz"
          style={{
            height: "calc(100vh - 180px)",
            width: "100%",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : rowData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <img src={noRecordsImage} alt="No records" className="w-32 h-32 opacity-50" />
              <p>No data available</p>
            </div>
          ) : (
            <AgGridReact
              rowData={rowData}
              columnDefs={getColumnsForReport(reportType)}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
              }}
              pagination={true}
              paginationPageSize={25}
              paginationPageSizeSelector={[25, 50, 100, 200]}
              animateRows={true}
              onGridReady={(params) => {
                gridApiRef.current = params.api;
              }}
              domLayout="normal"
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
