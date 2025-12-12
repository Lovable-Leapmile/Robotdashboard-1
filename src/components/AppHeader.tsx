import { useNavigate } from "react-router-dom";
import { ScrollText, Activity, LogOut, Camera, Menu, X, Home, ClipboardList, Video, FileText, Settings, Box, Layers, Grid3X3, Building2, TrendingUp, Download, Shield } from "lucide-react";
import fabIcon from "@/assets/fab-icon.png";
import { useState } from "react";
import html2canvas from "html2canvas";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AppHeaderProps {
  selectedTab: string;
  isTasksPage?: boolean;
  activeTaskTab?: string;
  isMonitorPage?: boolean;
  isCameraPage?: boolean;
  isReportsPage?: boolean;
  isLogsPage?: boolean;
}

const AppHeader = ({ selectedTab, isTasksPage, activeTaskTab, isMonitorPage, isCameraPage, isReportsPage, isLogsPage }: AppHeaderProps) => {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("login_timestamp");
    navigate("/");
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    handleLogout();
  };

  const handleTabClick = (tab: string) => {
    const routes: { [key: string]: string } = {
      "Robot": "/home",
      "Racks": "/racks",
      "Trays": "/trays",
      "Slots": "/slots",
      "Station": "/station",
      "Extremes": "/extremes",
      "APK Link": "/apk-link",
      "Admin Console": "/admin-console"
    };
    if (routes[tab]) {
      navigate(routes[tab]);
      setMobileMenuOpen(false);
    }
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleScreenshot = async () => {
    try {
      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight
      });
      
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `screenshot-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  };

  const mainNavItems = [
    { label: "Configuration", path: "/home", active: selectedTab && !isTasksPage && !isCameraPage && !isReportsPage },
    { label: "Tasks", path: "/tasks", active: isTasksPage },
    { label: "Camera", path: "/camera", active: isCameraPage },
    { label: "Reports", path: "/reports", active: isReportsPage },
  ];

  const configTabs = [
    { label: "Robot", icon: Home, tab: "Robot" },
    { label: "Racks", icon: Layers, tab: "Racks" },
    { label: "Trays", icon: Box, tab: "Trays" },
    { label: "Slots", icon: Grid3X3, tab: "Slots" },
    { label: "Station", icon: Building2, tab: "Station" },
    { label: "Extremes", icon: TrendingUp, tab: "Extremes" },
    { label: "APK Link", icon: Download, tab: "APK Link" },
    { label: "Admin Console", icon: Shield, tab: "Admin Console" },
  ];

  const taskTabs = [
    { label: "Completed", path: "/completed" },
    { label: "Pending", path: "/pending" },
    { label: "Tray Ready", path: "/tray-ready" },
    { label: "Inprogress", path: "/inprogress" },
  ];

  return (
    <>
      <header 
        className="flex items-center justify-between px-2 sm:px-4"
        style={{ backgroundColor: '#351C75', height: '55px' }}
      >
        <div className="flex items-center gap-2 sm:gap-[10px]">
          {/* Mobile Hamburger Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button 
                className="md:hidden rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity w-9 h-9"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                aria-label="Open menu"
              >
                <Menu className="text-white w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 bg-white">
              <SheetHeader className="p-4 border-b" style={{ backgroundColor: '#351C75' }}>
                <div className="flex items-center gap-3">
                  <img src={fabIcon} alt="Logo" className="w-10 h-10 object-contain" />
                  <SheetTitle className="text-white text-lg">Menu</SheetTitle>
                </div>
              </SheetHeader>
              
              <div className="py-2">
                {/* Main Navigation */}
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Navigation</p>
                  {mainNavItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        item.active ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      {item.label === "Configuration" && <Settings className="w-5 h-5" />}
                      {item.label === "Tasks" && <ClipboardList className="w-5 h-5" />}
                      {item.label === "Camera" && <Video className="w-5 h-5" />}
                      {item.label === "Reports" && <FileText className="w-5 h-5" />}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Configuration Sub-tabs */}
                {selectedTab && !isTasksPage && !isCameraPage && !isReportsPage && !isLogsPage && (
                  <div className="px-3 py-2 border-t">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Configuration</p>
                    {configTabs.map((item) => (
                      <button
                        key={item.tab}
                        onClick={() => handleTabClick(item.tab)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                          selectedTab === item.tab ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Task Sub-tabs */}
                {isTasksPage && (
                  <div className="px-3 py-2 border-t">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tasks</p>
                    {taskTabs.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleNavClick(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                          activeTaskTab === item.label ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="px-3 py-2 border-t">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Quick Actions</p>
                  <button
                    onClick={() => handleNavClick("/logs")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                      isLogsPage ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <ScrollText className="w-4 h-4" />
                    <span>Logs</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("/monitor")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                      isMonitorPage ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    <span>Monitor</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="px-3 py-2 border-t">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogoutClick();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div 
            className="rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity shrink-0"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '4px' }}
            onClick={() => navigate("/home")}
          >
            <img src={fabIcon} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-[15px]">
            {mainNavItems.map((item) => (
              <span 
                key={item.path}
                className={`text-base cursor-pointer hover:opacity-80 whitespace-nowrap ${item.active ? 'font-semibold' : ''}`} 
                style={{ color: item.active ? 'white' : 'rgba(255, 255, 255, 0.5)' }}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </span>
            ))}
          </nav>
        </div>
        
        <TooltipProvider>
          <div className="flex items-center gap-1 sm:gap-[10px]">
            {selectedTab === "Robot" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-white/30 w-8 h-8 sm:w-10 sm:h-10"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.20)' }}
                    onClick={handleScreenshot}
                  >
                    <Camera className="text-white w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white text-gray-800 border border-gray-200">
                  <p>Screenshot</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="hidden sm:flex rounded-full items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-white/30 w-10 h-10"
                  style={{ 
                    backgroundColor: isLogsPage ? 'rgba(255, 255, 255, 0.40)' : 'rgba(255, 255, 255, 0.20)', 
                    boxShadow: isLogsPage ? '0 0 0 2px rgba(255, 255, 255, 0.5)' : 'none'
                  }}
                  onClick={() => navigate("/logs")}
                >
                  <ScrollText className="text-white w-[18px] h-[18px]" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-gray-800 border border-gray-200">
                <p>Logs</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="hidden sm:flex rounded-full items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-white/30 w-10 h-10"
                  style={{ 
                    backgroundColor: isMonitorPage ? 'rgba(255, 255, 255, 0.40)' : 'rgba(255, 255, 255, 0.20)', 
                    boxShadow: isMonitorPage ? '0 0 0 2px rgba(255, 255, 255, 0.5)' : 'none'
                  }}
                  onClick={() => navigate("/monitor")}
                >
                  <Activity className="text-white w-[18px] h-[18px]" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-gray-800 border border-gray-200">
                <p>Monitor</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="hidden sm:flex rounded-full items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-white/30 w-10 h-10"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.20)' }}
                  onClick={handleLogoutClick}
                >
                  <LogOut className="text-white w-[18px] h-[18px]" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-gray-800 border border-gray-200">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </header>

      {/* Desktop Sub-navigation for Configuration */}
      {selectedTab && !isTasksPage && !isCameraPage && !isReportsPage && !isLogsPage && (
        <nav 
          className="hidden md:flex items-center px-6 gap-[8px] border-b border-gray-200 overflow-x-auto"
          style={{ backgroundColor: '#eeeeee', height: '55px' }}
        >
          {configTabs.map((item) => (
            <span 
              key={item.tab}
              className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group whitespace-nowrap" 
              style={{ color: '#555' }}
              onClick={() => handleTabClick(item.tab)}
            >
              {item.label}
              <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${selectedTab === item.tab ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </span>
          ))}
        </nav>
      )}

      {/* Desktop Sub-navigation for Tasks */}
      {isTasksPage && (
        <nav 
          className="hidden md:flex items-center px-6 gap-[8px] border-b border-gray-200 overflow-x-auto"
          style={{ backgroundColor: '#eeeeee', height: '55px' }}
        >
          {taskTabs.map((item) => (
            <span
              key={item.path}
              className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group whitespace-nowrap"
              style={{ color: '#555' }}
              onClick={() => navigate(item.path)}
            >
              {item.label}
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                  activeTaskTab === item.label ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              ></span>
            </span>
          ))}
        </nav>
      )}

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="w-[90%] max-w-[330px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-4">
            <AlertDialogCancel className="w-full sm:w-32">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="w-full sm:w-32">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppHeader;
