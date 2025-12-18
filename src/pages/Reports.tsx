import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useAuthSession } from "@/hooks/useAuthSession";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download, Package, ShoppingCart, Archive, Layers, AlertTriangle, Grid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import noRecordsImage from "@/assets/no_records.png";

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

const AUTH_TOKEN = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc";

type ReportType =
  | "product_stock"
  | "order_product_transaction"
  | "order_tray_transaction"
  | "tray_transaction"
  | "rack_transaction"
  | "order_failure_transaction";

interface ReportConfig {
  label: string;
  icon: React.ReactNode;
  endpoint: string;
  columns: ColDef[];
}

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return "N/A";
  try {
    return format(new Date(value), "dd-MM-yyyy HH:mm");
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
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const robotId = searchParams.get("robot_id") || "AMSSTORES1-Nano";

  const [reportType, setReportType] = useState<ReportType>("product_stock");
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [occupiedPercent, setOccupiedPercent] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Product Stock Report columns
  // Headers: Transaction Date, Receive Date, Item Id, Stock, Tray ID, Tray Weight(Kg), Item Description
  const productStockColumns: ColDef[] = [
    { 
      field: "updated_at", 
      headerName: "Transaction Date", 
      minWidth: 150,
      flex: 1, 
      valueFormatter: (params) => formatDateTime(params.value)
    },
    { 
      field: "created_at", 
      headerName: "Receive Date", 
      minWidth: 120,
      flex: 1, 
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: "item_id", 
      headerName: "Item Id", 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "item_quantity", 
      headerName: "Stock", 
      minWidth: 80,
      width: 100,
      valueFormatter: (params) => params.value ?? 0
    },
    { 
      field: "tray_id", 
      headerName: "Tray ID", 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "tray_weight", 
      headerName: "Tray Weight(Kg)", 
      minWidth: 130,
      width: 140,
      valueFormatter: (params) => params.value ? (params.value / 1000).toFixed(2) : "N/A"
    },
    { 
      field: "item_description", 
      headerName: "Item Description", 
      minWidth: 200,
      flex: 2,
      valueFormatter: (params) => params.value ?? "N/A"
    },
  ];

  // Order Product Transaction columns
  // Headers: Transaction Date, Activity Type, Order Id, User Id, User Name, User Phone, Tray ID, Item Id, Item Processed Quantity
  const orderProductColumns: ColDef[] = [
    { 
      field: "updated_at", 
      headerName: "Transaction Date", 
      minWidth: 150,
      flex: 1, 
      valueFormatter: (params) => formatDateTime(params.value)
    },
    { 
      field: "transaction_type", 
      headerName: "Activity Type", 
      minWidth: 110,
      width: 120,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "order_id", 
      headerName: "Order Id", 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "user_id", 
      headerName: "User Id", 
      minWidth: 100,
      width: 110,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "user_name", 
      headerName: "User Name", 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "user_phone", 
      headerName: "User Phone", 
      minWidth: 120,
      width: 130,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "tray_id", 
      headerName: "Tray ID", 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "item_id", 
      headerName: "Item Id", 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "picked_count", 
      headerName: "Item Processed Quantity", 
      minWidth: 180,
      width: 180,
      valueFormatter: (params) => params.value ?? 0
    },
  ];

  // Order Tray Transaction columns
  // Headers: Transaction Date, Order Id, Status, Tray ID, Station, Item Id, Item Order Quantity, Order Ref Id
  const orderTrayColumns: ColDef[] = [
    { 
      field: "created_at", 
      headerName: "Transaction Date", 
      minWidth: 150,
      flex: 1, 
      valueFormatter: (params) => formatDateTime(params.value)
    },
    { 
      field: "order_id", 
      headerName: "Order Id", 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "status", 
      headerName: "Status", 
      minWidth: 100,
      width: 120,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "tray_id", 
      headerName: "Tray ID", 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "station_name", 
      headerName: "Station", 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "item_id", 
      headerName: "Item Id", 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "item_order_quantity", 
      headerName: "Item Order Quantity", 
      minWidth: 150,
      width: 160,
      valueFormatter: (params) => params.value ?? 0
    },
    { 
      field: "order_ref_id", 
      headerName: "Order Ref Id", 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
  ];

  // Tray Transaction columns
  // Headers: Transaction Date, Tray Id, Tray Status, Division, Tray Weight(Kg), Tray Height, Number of Items, Total Available Quantity, Has Item
  const trayTransactionColumns: ColDef[] = [
    { 
      field: "updated_at", 
      headerName: "Transaction Date", 
      minWidth: 150,
      flex: 1, 
      valueFormatter: (params) => formatDateTime(params.value)
    },
    { 
      field: "tray_id", 
      headerName: "Tray Id", 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "tray_status", 
      headerName: "Tray Status", 
      minWidth: 100,
      width: 120,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "tray_divider", 
      headerName: "Division", 
      minWidth: 90,
      width: 100,
      valueFormatter: (params) => params.value ?? 0
    },
    { 
      field: "tray_weight", 
      headerName: "Tray Weight(Kg)", 
      minWidth: 130,
      width: 140,
      valueFormatter: (params) => params.value ? (params.value / 1000).toFixed(2) : "N/A"
    },
    { 
      field: "tray_height", 
      headerName: "Tray Height", 
      minWidth: 100,
      width: 110,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "number_of_items", 
      headerName: "Number of Items", 
      minWidth: 130,
      width: 140,
      valueFormatter: (params) => params.value ?? 0
    },
    { 
      field: "total_available_quantity", 
      headerName: "Total Available Quantity", 
      minWidth: 170,
      width: 180,
      valueFormatter: (params) => params.value ?? 0
    },
    { 
      field: "has_item", 
      headerName: "Has Item", 
      minWidth: 90,
      width: 100,
      valueFormatter: (params) => params.value ? "Yes" : "No"
    },
  ];

  // Rack Transaction columns
  // Headers: Transaction Date, Rack, Occupied Slots, Free Slots, Rack Occupancy In %
  const rackTransactionColumns: ColDef[] = [
    { 
      field: "updated_at", 
      headerName: "Transaction Date", 
      minWidth: 150,
      flex: 1, 
      valueFormatter: (params) => formatDateTime(params.value)
    },
    { 
      field: "rack_name", 
      headerName: "Rack", 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "occupied_slots", 
      headerName: "Occupied Slots", 
      minWidth: 130,
      width: 140,
      valueFormatter: (params) => params.value ?? 0
    },
    { 
      field: "free_slots", 
      headerName: "Free Slots", 
      minWidth: 100,
      width: 120,
      valueFormatter: (params) => params.value ?? 0
    },
    { 
      field: "rack_occupancy_percent", 
      headerName: "Rack Occupancy In %", 
      minWidth: 160,
      width: 170,
      valueFormatter: (params) => params.value !== undefined ? `${Number(params.value).toFixed(2)}%` : "N/A"
    },
  ];

  // Order Failure Transaction columns
  // Headers: Transaction Date, Order Id, Activity, Item ID, Movement Type, Order Type, Item Order Quantity, Message
  const orderFailureColumns: ColDef[] = [
    { 
      field: "created_at", 
      headerName: "Transaction Date", 
      minWidth: 150,
      flex: 1, 
      valueFormatter: (params) => formatDateTime(params.value)
    },
    { 
      field: "order_id", 
      headerName: "Order Id", 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "activity", 
      headerName: "Activity", 
      minWidth: 100,
      width: 120,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "item_id", 
      headerName: "Item ID", 
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "movement_type", 
      headerName: "Movement Type", 
      minWidth: 130,
      width: 140,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "order_type", 
      headerName: "Order Type", 
      minWidth: 110,
      width: 120,
      valueFormatter: (params) => params.value ?? "N/A"
    },
    { 
      field: "item_order_quantity", 
      headerName: "Item Order Quantity", 
      minWidth: 150,
      width: 160,
      valueFormatter: (params) => params.value ?? 0
    },
    { 
      field: "message", 
      headerName: "Message", 
      minWidth: 200,
      flex: 2,
      valueFormatter: (params) => params.value ?? "N/A"
    },
  ];

  const reportConfigs: Record<ReportType, ReportConfig> = useMemo(() => ({
    product_stock: {
      label: "Product Stock Report",
      icon: <Package className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/nanostore/stock",
      columns: productStockColumns,
    },
    order_product_transaction: {
      label: "Order Product Transaction",
      icon: <ShoppingCart className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/nanostore/items/usage?order_by=DESC",
      columns: orderProductColumns,
    },
    order_tray_transaction: {
      label: "Order Tray Transaction",
      icon: <Archive className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/robotmanager/task",
      columns: orderTrayColumns,
    },
    tray_transaction: {
      label: "Tray Transaction",
      icon: <Layers className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/robotmanager/trays",
      columns: trayTransactionColumns,
    },
    rack_transaction: {
      label: "Rack Transaction",
      icon: <Grid className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/robotmanager/racks/summary",
      columns: rackTransactionColumns,
    },
    order_failure_transaction: {
      label: "Order Failure Transaction",
      icon: <AlertTriangle className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/robotmanager/task?task_status=failed",
      columns: orderFailureColumns,
    },
  }), []);

  const fetchOccupiedPercent = useCallback(async () => {
    try {
      const [slotsResponse, traysResponse] = await Promise.all([
        fetch("https://amsstores1.leapmile.com/robotmanager/slots_count?slot_status=active", {
          headers: { "Authorization": AUTH_TOKEN, "Content-Type": "application/json" }
        }),
        fetch("https://amsstores1.leapmile.com/robotmanager/trays?tray_status=active", {
          headers: { "Authorization": AUTH_TOKEN, "Content-Type": "application/json" }
        })
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
      const config = reportConfigs[reportType];
      let url = config.endpoint;
      const separator = url.includes("?") ? "&" : "?";
      url = `${url}${separator}num_records=${pageSize}&offset=${(currentPage - 1) * pageSize}`;
      
      const response = await fetch(url, {
        headers: { 
          "Authorization": AUTH_TOKEN, 
          "Content-Type": "application/json" 
        }
      });

      if (response.status === 404) {
        // Try fallback endpoints for certain report types
        if (reportType === "product_stock") {
          const fallbackResponse = await fetch(`https://amsstores1.leapmile.com/nanostore/items?num_records=${pageSize}&offset=${(currentPage - 1) * pageSize}`, {
            headers: { "Authorization": AUTH_TOKEN, "Content-Type": "application/json" }
          });
          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            setRowData(data.records || []);
            setTotalCount(data.total_count || data.count || data.rowcount || 0);
            return;
          }
        } else if (reportType === "rack_transaction") {
          // Fallback to slots endpoint and aggregate by rack
          const fallbackResponse = await fetch(`https://amsstores1.leapmile.com/robotmanager/slots?num_records=1000&offset=0`, {
            headers: { "Authorization": AUTH_TOKEN, "Content-Type": "application/json" }
          });
          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            const rackData = aggregateSlotsByRack(data.records || []);
            setRowData(rackData);
            setTotalCount(rackData.length);
            return;
          }
        }
        setRowData([]);
        setTotalCount(0);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle rack transaction with aggregation if needed
      if (reportType === "rack_transaction" && data.records && !data.records[0]?.rack_name) {
        const rackData = aggregateSlotsByRack(data.records);
        setRowData(rackData);
        setTotalCount(rackData.length);
      } else {
        setRowData(data.records || []);
        setTotalCount(data.total_count || data.count || data.rowcount || 0);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
      console.error("Error fetching report data:", error);
      setRowData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [reportType, currentPage, pageSize, reportConfigs, toast]);

  // Helper function to aggregate slots by rack
  const aggregateSlotsByRack = (slots: any[]) => {
    const rackMap: Record<string, { total: number; occupied: number; updated_at: string }> = {};
    
    slots.forEach(slot => {
      const rackName = slot.slot_id?.split("-")[0] || slot.rack_name || "Unknown";
      if (!rackMap[rackName]) {
        rackMap[rackName] = { total: 0, occupied: 0, updated_at: slot.updated_at };
      }
      rackMap[rackName].total++;
      if (slot.tray_id) {
        rackMap[rackName].occupied++;
      }
      // Keep the latest updated_at
      if (slot.updated_at > rackMap[rackName].updated_at) {
        rackMap[rackName].updated_at = slot.updated_at;
      }
    });

    return Object.entries(rackMap).map(([rackName, data]) => ({
      rack_name: rackName,
      occupied_slots: data.occupied,
      free_slots: data.total - data.occupied,
      rack_occupancy_percent: data.total > 0 ? (data.occupied / data.total) * 100 : 0,
      updated_at: data.updated_at
    }));
  };

  useEffect(() => {
    fetchOccupiedPercent();
  }, [fetchOccupiedPercent]);

  useEffect(() => {
    setCurrentPage(1);
  }, [reportType]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleRefresh = () => {
    fetchReportData();
    fetchOccupiedPercent();
  };

  const handleDownload = () => {
    if (rowData.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to download",
        variant: "destructive",
      });
      return;
    }

    const config = reportConfigs[reportType];
    const headers = config.columns.map(col => col.headerName).join(",");
    const rows = rowData.map(row => 
      config.columns.map(col => {
        const field = col.field as string;
        let value = row[field];
        if (field === "created_at" || field === "updated_at") {
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
        if (field === "tags" && Array.isArray(value)) {
          value = value.join(", ");
        }
        return `"${value ?? "N/A"}"`;
      }).join(",")
    ).join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportConfigs[reportType].label.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const startRecord = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader selectedTab="reports" isReportsPage={true} />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Reports</h1>
              <p className="text-sm text-muted-foreground mt-1">Robot ID: {robotId}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
                <span className="text-xs sm:text-sm text-muted-foreground">Occupied: </span>
                <span className="text-sm sm:text-base font-semibold text-primary">{occupiedPercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center flex-1">
              <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
                <SelectTrigger className="w-full sm:w-[280px] bg-card border-border">
                  <SelectValue placeholder="Select Report Type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  {Object.entries(reportConfigs).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="hover:bg-muted">
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-full sm:w-[130px] bg-card border-border">
                  <SelectValue placeholder="Page Size" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                  <SelectItem value="200">200 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownload}
                disabled={loading || rowData.length === 0}
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Download CSV</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Data Grid Section */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : rowData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <img src={noRecordsImage} alt="No records" className="w-24 h-24 sm:w-32 sm:h-32 opacity-50 mb-4" />
              <p className="text-muted-foreground text-sm sm:text-base">No data available for this report</p>
            </div>
          ) : (
            <div 
              className="ag-theme-alpine w-full" 
              style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}
            >
              <AgGridReact
                rowData={rowData}
                columnDefs={reportConfigs[reportType].columns}
                defaultColDef={defaultColDef}
                animateRows={true}
                pagination={false}
                suppressPaginationPanel={true}
                domLayout="normal"
              />
            </div>
          )}
        </div>

        {/* Pagination Section */}
        {!loading && rowData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-2">
            <p className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
              Showing {startRecord} to {endRecord} of {totalCount} entries
            </p>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 sm:px-3"
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3"
              >
                Prev
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-3">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="px-2 sm:px-3"
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages}
                className="px-2 sm:px-3"
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;
