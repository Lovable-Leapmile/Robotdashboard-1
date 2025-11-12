import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Play, Download, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

ModuleRegistry.registerModules([AllCommunityModule]);

interface CameraEvent {
  task_id: string;
  clip_start_time: string;
  clip_stop_time: string;
  clip_filename: string;
  camera_device_id: string;
  clip_url: string;
}

const CameraTaskDetails = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CameraEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<CameraEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchCameraEvents(taskId);
    }
  }, [taskId]);

  useEffect(() => {
    if (!autoRefresh || !taskId) return;

    const interval = setInterval(() => {
      fetchCameraEvents(taskId);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, taskId]);

  const fetchCameraEvents = async (task_id: string) => {
    try {
      const response = await fetch(
        `https://amsstores1.leapmile.com/cameramanager/camera_events?clip_status=ready&task_id=${task_id}`,
        {
          headers: {
            Authorization:
              "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc",
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.records) {
        setEvents(data.records);
      }
    } catch (error) {
      console.error("Error fetching camera events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayClick = (event: CameraEvent) => {
    setSelectedVideo(event);
    setIsDialogOpen(true);
  };

  const handleDownloadClick = (clipUrl: string) => {
    window.open(clipUrl, "_blank");
  };

  const handleDownloadCSV = () => {
    if (events.length === 0) return;

    const headers = [
      "Task ID",
      "Start Time",
      "Stop Time",
      "File Name",
      "Camera Name",
      "Clip URL",
    ];

    const csvContent = [
      headers.join(","),
      ...events.map((event) =>
        [
          event.task_id,
          event.clip_start_time,
          event.clip_stop_time || "",
          event.clip_filename,
          event.camera_device_id,
          event.clip_url,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `camera_events_${taskId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columnDefs: ColDef[] = [
    {
      headerName: "Task ID",
      field: "task_id",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Start Time",
      field: "clip_start_time",
      flex: 1,
      minWidth: 180,
    },
    {
      headerName: "Stop Time",
      field: "clip_stop_time",
      flex: 1,
      minWidth: 180,
    },
    {
      headerName: "File Name",
      field: "clip_filename",
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: "Camera Name",
      field: "camera_device_id",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "View",
      width: 100,
      cellRenderer: (params: any) => (
        <button
          onClick={() => handlePlayClick(params.data)}
          className="flex items-center justify-center w-full h-full group"
        >
          <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary group-hover:scale-110 transition-all duration-200">
            <Play className="h-4 w-4 text-primary group-hover:text-primary-foreground fill-current" />
          </div>
        </button>
      ),
    },
    {
      headerName: "Download",
      width: 120,
      cellRenderer: (params: any) => (
        <button
          onClick={() => handleDownloadClick(params.data.clip_url)}
          className="flex items-center justify-center w-full h-full group"
        >
          <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary group-hover:scale-110 transition-all duration-200">
            <Download className="h-4 w-4 text-primary group-hover:text-primary-foreground" />
          </div>
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader selectedTab="" isCameraPage={true} />
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/camera")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </Button>
          <h1 className="text-2xl font-bold text-foreground absolute left-1/2 transform -translate-x-1/2">
            Task: {taskId}
          </h1>
          <TooltipProvider>
            <div className="flex items-center gap-[15px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleDownloadCSV}
                    className="p-2 rounded-full hover:bg-accent transition-colors"
                    disabled={events.length === 0}
                  >
                    <Download className="h-5 w-5 text-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download CSV</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="auto-refresh"
                      checked={autoRefresh}
                      onCheckedChange={(checked) => setAutoRefresh(checked as boolean)}
                    />
                    <label
                      htmlFor="auto-refresh"
                      className="cursor-pointer flex items-center"
                    >
                      <RefreshCw className="h-5 w-5 text-foreground" />
                    </label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Auto Refresh</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-12">
              Loading camera events...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No camera events found for this task
            </div>
          ) : (
            <div className="ag-theme-quartz w-full" style={{ height: 'calc(100vh - 180px)' }}>
              <AgGridReact
                rowData={events}
                columnDefs={columnDefs}
                defaultColDef={{
                  sortable: true,
                  filter: true,
                  resizable: true,
                }}
                rowHeight={60}
                pagination={true}
                paginationPageSize={50}
                domLayout="normal"
              />
            </div>
          )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="p-0 gap-0 w-[90vw] max-w-4xl h-auto max-h-[90vh]"
          style={{ 
            background: 'linear-gradient(135deg, #f3f0ff 0%, #ffffff 100%)',
            border: '2px solid #351c75'
          }}
        >
          {/* Title Row */}
          <div className="flex items-center justify-center relative px-6 pt-6 pb-2.5">
            <DialogTitle className="text-lg font-semibold text-center" style={{ color: '#351c75' }}>
              {selectedVideo?.camera_device_id}
            </DialogTitle>
          </div>

          {/* Video Row */}
          {selectedVideo && (
            <>
              <div className="flex items-center justify-center px-6 pt-2.5 pb-4">
                <video
                  controls
                  autoPlay
                  className="w-full rounded-lg shadow-lg"
                  style={{ maxHeight: '70vh' }}
                  src={selectedVideo.clip_url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Filename Row */}
              <div className="flex items-center justify-center px-6 pb-6 pt-2">
                <p className="text-sm font-bold text-center" style={{ color: '#351c75' }}>
                  {selectedVideo.clip_filename}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CameraTaskDetails;
