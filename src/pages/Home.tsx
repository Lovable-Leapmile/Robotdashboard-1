import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollText, Activity, LogOut } from "lucide-react";
import whiteLogo from "@/assets/white_logo.png";

const Home = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    setUserName(storedUserName);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    navigate("/");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
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
          <nav className="flex items-center gap-[10px]">
            <span className="text-white text-base cursor-pointer hover:opacity-80">Configuration</span>
            <span className="text-white text-base cursor-pointer hover:opacity-80">Tasks</span>
            <span className="text-white text-base cursor-pointer hover:opacity-80">Camera</span>
            <span className="text-white text-base cursor-pointer hover:opacity-80">Reports</span>
          </nav>
        </div>
        
        <div className="flex items-center gap-[10px]">
          <div 
            className="rounded-full flex items-center justify-center cursor-pointer hover:opacity-80"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.20)', width: '40px', height: '40px' }}
          >
            <ScrollText className="text-white" size={18} />
          </div>
          <div 
            className="rounded-full flex items-center justify-center cursor-pointer hover:opacity-80"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.20)', width: '40px', height: '40px' }}
          >
            <Activity className="text-white" size={18} />
          </div>
          <div 
            className="rounded-full flex items-center justify-center cursor-pointer hover:opacity-80"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.20)', width: '40px', height: '40px' }}
            onClick={handleLogout}
          >
            <LogOut className="text-white" size={18} />
          </div>
        </div>
      </header>

      <nav 
        className="flex items-center px-6 gap-[8px] border-b border-gray-200"
        style={{ backgroundColor: '#eeeeee', height: '55px' }}
      >
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium relative group" 
          style={{ color: '#555' }}
        >
          Robot
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600"></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium hover:shadow-md relative group" 
          style={{ color: '#555' }}
        >
          Racks
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium hover:shadow-md relative group" 
          style={{ color: '#555' }}
        >
          Trays
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium hover:shadow-md relative group" 
          style={{ color: '#555' }}
        >
          Slots
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium hover:shadow-md relative group" 
          style={{ color: '#555' }}
        >
          Station
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium hover:shadow-md relative group" 
          style={{ color: '#555' }}
        >
          Extremes
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
        </span>
        <span 
          className="text-sm cursor-pointer px-5 py-2 rounded-md transition-all font-medium hover:shadow-md relative group" 
          style={{ color: '#555' }}
        >
          APK Link
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
        </span>
      </nav>
    </div>
  );
};

export default Home;
