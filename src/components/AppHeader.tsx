import { useNavigate } from "react-router-dom";
import { ScrollText, Activity, LogOut } from "lucide-react";
import whiteLogo from "@/assets/white_logo.png";
import { useState } from "react";
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

interface AppHeaderProps {
  selectedTab: string;
  isTasksPage?: boolean;
  activeTaskTab?: string;
  onTaskTabChange?: (tab: string) => void;
  isMonitorPage?: boolean;
}

const AppHeader = ({ selectedTab, isTasksPage, activeTaskTab, onTaskTabChange, isMonitorPage }: AppHeaderProps) => {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
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
      "APK Link": "/apk-link"
    };
    if (routes[tab]) {
      navigate(routes[tab]);
    }
  };

  return (
    <>
      <header 
        className="flex items-center justify-between px-4"
        style={{ backgroundColor: '#351C75', height: '55px' }}
      >
        <div className="flex items-center gap-[10px]">
          <div 
            className="rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(53, 28, 117, 0.20)', padding: '15px' }}
          >
            <img src={whiteLogo} alt="Logo" style={{ width: '75px' }} />
          </div>
          <nav className="flex items-center gap-[15px]">
            <span 
              className={`text-base cursor-pointer hover:opacity-80 ${selectedTab && !isTasksPage ? 'font-semibold' : ''}`} 
              style={{ color: selectedTab && !isTasksPage ? 'white' : '#80ffffff' }}
              onClick={() => navigate("/home")}
            >
              Configuration
            </span>
            <span 
              className={`text-base cursor-pointer hover:opacity-80 ${isTasksPage ? 'font-semibold' : ''}`} 
              style={{ color: isTasksPage ? 'white' : '#80ffffff' }}
              onClick={() => navigate("/tasks")}
            >
              Tasks
            </span>
            <span className="text-base cursor-pointer hover:opacity-80" style={{ color: '#80ffffff' }}>Camera</span>
            <span className="text-base cursor-pointer hover:opacity-80" style={{ color: '#80ffffff' }}>Reports</span>
          </nav>
        </div>
        
        <TooltipProvider>
          <div className="flex items-center gap-[10px]">
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-white/30"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.20)', width: '40px', height: '40px' }}
                >
                  <ScrollText className="text-white" size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-gray-800 border border-gray-200">
                <p>Logs</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-white/30"
                  style={{ 
                    backgroundColor: isMonitorPage ? 'rgba(255, 255, 255, 0.40)' : 'rgba(255, 255, 255, 0.20)', 
                    width: '40px', 
                    height: '40px',
                    boxShadow: isMonitorPage ? '0 0 0 2px rgba(255, 255, 255, 0.5)' : 'none'
                  }}
                  onClick={() => navigate("/monitor")}
                >
                  <Activity className="text-white" size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-gray-800 border border-gray-200">
                <p>Monitor</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-white/30"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.20)', width: '40px', height: '40px' }}
                  onClick={handleLogoutClick}
                >
                  <LogOut className="text-white" size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white text-gray-800 border border-gray-200">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </header>

      {selectedTab && !isTasksPage && (
        <nav 
          className="flex items-center px-6 gap-[8px] border-b border-gray-200"
          style={{ backgroundColor: '#eeeeee', height: '55px' }}
        >
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group" 
          style={{ color: '#555' }}
          onClick={() => handleTabClick("Robot")}
        >
          Robot
          <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${selectedTab === "Robot" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group" 
          style={{ color: '#555' }}
          onClick={() => handleTabClick("Racks")}
        >
          Racks
          <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${selectedTab === "Racks" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group" 
          style={{ color: '#555' }}
          onClick={() => handleTabClick("Trays")}
        >
          Trays
          <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${selectedTab === "Trays" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group" 
          style={{ color: '#555' }}
          onClick={() => handleTabClick("Slots")}
        >
          Slots
          <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${selectedTab === "Slots" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group" 
          style={{ color: '#555' }}
          onClick={() => handleTabClick("Station")}
        >
          Station
          <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${selectedTab === "Station" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group" 
          style={{ color: '#555' }}
          onClick={() => handleTabClick("Extremes")}
        >
          Extremes
          <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${selectedTab === "Extremes" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group" 
          style={{ color: '#555' }}
          onClick={() => handleTabClick("APK Link")}
        >
          APK Link
          <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${selectedTab === "APK Link" ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
        </span>
      </nav>
      )}

      {isTasksPage && onTaskTabChange && (
        <nav 
          className="flex items-center px-6 gap-[8px] border-b border-gray-200"
          style={{ backgroundColor: '#eeeeee', height: '55px' }}
        >
          {["Pending", "Tray Ready", "Inprogress", "Completed"].map((tab) => (
            <span
              key={tab}
              className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group"
              style={{ color: '#555' }}
              onClick={() => onTaskTabChange(tab)}
            >
              {tab}
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                  activeTaskTab === tab ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              ></span>
            </span>
          ))}
        </nav>
      )}

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppHeader;
