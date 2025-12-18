import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useAuthSession } from "@/hooks/useAuthSession";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download, Package, ShoppingCart, Archive, Layers, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [pageSize] = useState(50);

  const reportConfigs: Record<ReportType, ReportConfig> = useMemo(() => ({
    product_stock: {
      label: "Product Stock Report",
      icon: <Package className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/nanostore/items",
      columns: [
        { field: "id", headerName: "S.No", width: 80, valueGetter: (params) => params.node?.rowIndex ? params.node.rowIndex + 1 : 1 },
        { field: "created_at", headerName: "Transaction Date", flex: 1, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "-" },
        { field: "updated_at", headerName: "Receive Date", flex: 1, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "-" },
        { field: "item_id", headerName: "Item Id", flex: 1 },
        { field: "stock", headerName: "Stock", width: 100 },
        { field: "tray_id", headerName: "Tray ID", flex: 1 },
        { field: "tray_weight", headerName: "Tray Weight (kg)", width: 130, valueFormatter: (params) => params.value ? (params.value / 1000).toFixed(2) : "-" },
        { field: "item_description", headerName: "Item Description", flex: 2 },
      ],
    },
    order_product_transaction: {
      label: "Order Product Transaction",
      icon: <ShoppingCart className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/nanostore/order_items",
      columns: [
        { field: "id", headerName: "S.No", width: 80, valueGetter: (params) => params.node?.rowIndex ? params.node.rowIndex + 1 : 1 },
        { field: "created_at", headerName: "Order Date", flex: 1, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "-" },
        { field: "order_id", headerName: "Order ID", flex: 1 },
        { field: "item_id", headerName: "Item ID", flex: 1 },
        { field: "quantity", headerName: "Quantity", width: 100 },
        { field: "status", headerName: "Status", width: 120 },
        { field: "updated_at", headerName: "Updated At", flex: 1, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "-" },
      ],
    },
    order_tray_transaction: {
      label: "Order Tray Transaction",
      icon: <Archive className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/robotmanager/tasks",
      columns: [
        { field: "id", headerName: "S.No", width: 80, valueGetter: (params) => params.node?.rowIndex ? params.node.rowIndex + 1 : 1 },
        { field: "created_at", headerName: "Task Date", flex: 1, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "-" },
        { field: "task_id", headerName: "Task ID", flex: 1 },
        { field: "tray_id", headerName: "Tray ID", flex: 1 },
        { field: "order_reference_id", headerName: "Order Ref", flex: 1 },
        { field: "task_status", headerName: "Status", width: 120 },
        { field: "updated_at", headerName: "Completed At", flex: 1, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "-" },
      ],
    },
    tray_transaction: {
      label: "Tray Transaction",
      icon: <Layers className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/robotmanager/trays",
      columns: [
        { field: "id", headerName: "S.No", width: 80, valueGetter: (params) => params.node?.rowIndex ? params.node.rowIndex + 1 : 1 },
        { field: "created_at", headerName: "Created Date", flex: 1, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "-" },
        { field: "tray_id", headerName: "Tray ID", flex: 1 },
        { field: "tray_status", headerName: "Status", width: 120 },
        { field: "tray_height", headerName: "Height", width: 100 },
        { field: "tray_weight", headerName: "Weight (kg)", width: 120, valueFormatter: (params) => params.value ? (params.value / 1000).toFixed(2) : "-" },
        { field: "tray_divider", headerName: "Divider", width: 100 },
        { field: "updated_at", headerName: "Updated At", flex: 1, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "-" },
      ],
    },
    rack_transaction: {
      label: "Rack Transaction",
      icon: <Layers className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/robotmanager/slots",
      columns: [
        { field: "id", headerName: "S.No", width: 80, valueGetter: (params) => params.node?.rowIndex ? params.node.rowIndex + 1 : 1 },
        { field: "created_at", headerName: "Created Date", flex: 1, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "-" },
        { field: "slot_id", headerName: "Slot ID", flex: 1 },
        { field: "slot_name", headerName: "Slot Name", flex: 1 },
        { field: "rack", headerName: "Rack", width: 80 },
        { field: "row", headerName: "Row", width: 80 },
        { field: "slot", headerName: "Slot", width: 80 },
        { field: "tray_id", headerName: "Tray ID", flex: 1 },
        { field: "slot_status", headerName: "Status", width: 120 },
      ],
    },
    order_failure_transaction: {
      label: "Order Failure Transaction",
      icon: <AlertTriangle className="w-4 h-4" />,
      endpoint: "https://amsstores1.leapmile.com/robotmanager/tasks?task_status=failed",
      columns: [
        { field: "id", headerName: "S.No", width: 80, valueGetter: (params) => params.node?.rowIndex ? params.node.rowIndex + 1 : 1 },
        { field: "created_at", headerName: "Failure Date", flex: 1, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "-" },
        { field: "task_id", headerName: "Task ID", flex: 1 },
        { field: "tray_id", headerName: "Tray ID", flex: 1 },
        { field: "order_reference_id", headerName: "Order Ref", flex: 1 },
        { field: "task_status", headerName: "Status", width: 120 },
        { field: "updated_at", headerName: "Updated At", flex: 1, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : "-" },
      ],
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
      const separator = config.endpoint.includes("?") ? "&" : "?";
      const url = `${config.endpoint}${separator}num_records=${pageSize}&offset=${(currentPage - 1) * pageSize}`;
      
      const response = await fetch(url, {
        headers: { 
          "Authorization": AUTH_TOKEN, 
          "Content-Type": "application/json" 
        }
      });

      if (response.status === 404) {
        setRowData([]);
        setTotalCount(0);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRowData(data.records || []);
      setTotalCount(data.count || data.rowcount || 0);
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
          value = value ? new Date(value).toLocaleString() : "-";
        }
        if (field === "tray_weight") {
          value = value ? (value / 1000).toFixed(2) : "-";
        }
        return `"${value || ""}"`;
      }).join(",")
    ).join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const startRecord = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader selectedTab="" isReportsPage={true} />
      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header Section */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold text-foreground">
                  {reportConfigs[reportType].label}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Robot ID: <span className="font-medium text-foreground">{robotId}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 px-4 py-2 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Slots Occupied</p>
                  <p className="text-lg font-bold text-primary">{occupiedPercent.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(reportConfigs).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {config.icon}
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading || rowData.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          {/* Pagination Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
            <span>
              {totalCount > 0 ? `${startRecord} to ${endRecord} of ${totalCount}` : "No records"}.
              {totalPages > 0 && ` Page ${currentPage} of ${totalPages}`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : rowData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Package className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No Data Available</p>
                <p className="text-sm">Try selecting a different report type or refresh the data.</p>
              </div>
            ) : (
              <div className="ag-theme-alpine h-[500px] w-full">
                <AgGridReact
                  rowData={rowData}
                  columnDefs={reportConfigs[reportType].columns}
                  defaultColDef={defaultColDef}
                  animateRows={true}
                  rowSelection="single"
                  suppressCellFocus={true}
                />
              </div>
            )}
          </div>

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage <= 1 || loading}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || loading}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || loading}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages || loading}
              >
                Last
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
