import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Racks from "./pages/Racks";
import Trays from "./pages/Trays";
import Slots from "./pages/Slots";
import Station from "./pages/Station";
import Extremes from "./pages/Extremes";
import ApkLink from "./pages/ApkLink";
import AdminConsole from "./pages/AdminConsole";
import Monitor from "./pages/Monitor";
import Camera from "./pages/Camera";
import CameraTaskDetails from "./pages/CameraTaskDetails";
import Reports from "./pages/Reports";
import Logs from "./pages/Logs";
import Tasks from "./pages/Tasks";
import Pending from "./pages/Pending";
import TrayReady from "./pages/TrayReady";
import Inprogress from "./pages/Inprogress";
import Completed from "./pages/Completed";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Home />} />
          <Route path="/racks" element={<Racks />} />
          <Route path="/trays" element={<Trays />} />
          <Route path="/slots" element={<Slots />} />
          <Route path="/station" element={<Station />} />
          <Route path="/extremes" element={<Extremes />} />
          <Route path="/apk-link" element={<ApkLink />} />
          <Route path="/admin-console" element={<AdminConsole />} />
          <Route path="/monitor" element={<Monitor />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/camera/:taskId" element={<CameraTaskDetails />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/pending" element={<Pending />} />
          <Route path="/tray-ready" element={<TrayReady />} />
          <Route path="/inprogress" element={<Inprogress />} />
          <Route path="/completed" element={<Completed />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
