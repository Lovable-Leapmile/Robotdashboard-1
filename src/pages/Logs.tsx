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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Register AG Grid Community modules (required in v34+)
ModuleRegistry.registerModules([AllCommunityModule]);

interface LogData {
  created_at: string;
  message: any;
  station_slot_id: string;
  station_name: string;
  tray_id: string;
  slot_id: string;
  state: string;
}

const Logs = () => {
  useAuthSession();
  const [userName, setUserName] = useState("");
  const [rowData, setRowData] = useState<LogData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quickFilter, setQuickFilter] = useState("");
  const gridApiRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getFormattedData = (data: LogData[]) => {
    return data.map((row) => {
      const message = row.message;
      return {
        "Created At": row.created_at ? format(new Date(row.created_at), "dd-MM-yyyy HH:mm:ss") : "N/A",
        Message:
          typeof message === "object" && message?.msg
            ? message.msg.split("\\n")[0]
            : typeof message === "object"
              ? JSON.stringify(message).split("\\n")[0]
              : String(message || "N/A"),
        Action:
          typeof message === "object" && message?.metadata?.station_slot_id ? message.metadata.station_slot_id : "N/A",
        Status: typeof message === "object" && message?.status ? message.status : "N/A",
        "Tray ID": typeof message === "object" && message?.metadata?.tray_id ? message.metadata.tray_id : "N/A",
        "Slot ID": typeof message === "object" && message?.metadata?.slot_id ? message.metadata.slot_id : "N/A",
        State: typeof message === "object" && message?.metadata?.state ? message.metadata.state : "N/A",
      };
    });
  };

  const exportToCSV = () => {
    const formattedData = getFormattedData(rowData);
    if (formattedData.length === 0) {
      toast({
        title: "No Data",
        description: "No logs to export",
        variant: "destructive",
      });
      return;
    }

    const headers = Object.keys(formattedData[0]);
    const csvContent = [
      headers.join(","),
      ...formattedData.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row] || "";
            // Escape quotes and wrap in quotes if contains comma
            const escaped = String(value).replace(/"/g, '""');
            return escaped.includes(",") || escaped.includes('"') || escaped.includes("\n") ? `"${escaped}"` : escaped;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `logs_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({
      title: "Export Successful",
      description: "Logs exported to CSV file",
    });
  };

  const exportToExcel = () => {
    const formattedData = getFormattedData(rowData);
    if (formattedData.length === 0) {
      toast({
        title: "No Data",
        description: "No logs to export",
        variant: "destructive",
      });
      return;
    }

    const headers = Object.keys(formattedData[0]);

    // Create XML for Excel
    let excelContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Logs">
    <Table>
      <Row>
        ${headers.map((h) => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join("")}
      </Row>
      ${formattedData
        .map(
          (row) => `
      <Row>
        ${headers
          .map((header) => {
            const value = String(row[header as keyof typeof row] || "")
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
            return `<Cell><Data ss:Type="String">${value}</Data></Cell>`;
          })
          .join("")}
      </Row>`,
        )
        .join("")}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `logs_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.xls`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({
      title: "Export Successful",
      description: "Logs exported to Excel file",
    });
  };

  const columnDefs: ColDef<LogData>[] = [
    {
      field: "created_at",
      headerName: "Created At",
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
      },
    },
    {
      field: "message",
      headerName: "Message",
      sortable: true,
      filter: true,
      flex: 2,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";

        // If message is an object with a 'msg' field, use that
        let messageStr = "";
        if (typeof params.value === "object" && params.value.msg) {
          messageStr = params.value.msg;
        } else if (typeof params.value === "object") {
          messageStr = JSON.stringify(params.value);
        } else {
          messageStr = String(params.value);
        }

        // Trim at \n
        const newlineIndex = messageStr.indexOf("\\n");
        if (newlineIndex !== -1) {
          messageStr = messageStr.substring(0, newlineIndex);
        }
        return messageStr;
      },
    },
    {
      field: "message",
      headerName: "Action",
      sortable: true,
      filter: true,
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        if (typeof params.value === "object" && params.value.metadata?.station_slot_id) {
          return params.value.metadata.station_slot_id;
        }
        return "N/A";
      },
    },
    {
      field: "message",
      headerName: "Status",
      sortable: true,
      filter: true,
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        if (typeof params.value === "object" && params.value.status) {
          return params.value.status;
        }
        return "N/A";
      },
    },
    {
      field: "message",
      headerName: "Tray ID",
      sortable: true,
      filter: true,
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        if (typeof params.value === "object" && params.value.metadata?.tray_id) {
          return params.value.metadata.tray_id;
        }
        return "N/A";
      },
    },
    {
      field: "message",
      headerName: "Slot ID",
      sortable: true,
      filter: true,
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        if (typeof params.value === "object" && params.value.metadata?.slot_id) {
          return params.value.metadata.slot_id;
        }
        return "N/A";
      },
    },
    {
      field: "message",
      headerName: "State",
      sortable: true,
      filter: true,
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        if (typeof params.value === "object" && params.value.metadata?.state) {
          return params.value.metadata.state;
        }
        return "N/A";
      },
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
    fetchLogsData();
  }, [navigate]);

  const fetchLogsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://amsstores1.leapmile.com/pubsub/subscribe?topic=amsstores1_AMSSTORES1-Nano",
        {
          method: "GET",
          headers: {
            Authorization:
              "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc",
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      // Handle "no records found" as a normal case, not an error
      if (response.status === 404 && data.message === "no records found") {
        console.log("No logs found");
        setTotalCount(0);
        setRowData([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch logs data");
      }

      console.log("Fetched logs:", data?.records?.length);
      setTotalCount(data.count || 0);
      setRowData(data.records || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load logs data",
        variant: "destructive",
      });
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <AppHeader selectedTab="" isLogsPage={true} />

      <main className="p-2 sm:p-4">
        {/* Export Buttons */}
        {/* <div className="flex justify-end mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2"
                disabled={rowData.length === 0}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border border-border z-50">
              <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
                Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}

        {!loading && rowData.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 180px)" }}>
            <img src={noRecordsImage} alt="No Record found" className="w-48 sm:w-[340px]" />
          </div>
        ) : (
          <div className="ag-theme-quartz w-full overflow-visible" style={{ height: "calc(100vh - 90px)" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{
                resizable: true,
                minWidth: 80,
                sortable: true,
                filter: true,
              }}
              pagination={true}
              paginationPageSize={50}
              rowHeight={35}
              popupParent={document.body}
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

export default Logs;
