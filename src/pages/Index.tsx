import { useState, useEffect, useRef } from "react";
import LoginForm from "@/components/LoginForm";
import ApiConfigModal from "@/components/ApiConfigModal";
import backgroundImage from "@/assets/dashboard_login_bg.png";
import { isApiConfigured, getStoredApiConfig } from "@/lib/apiConfig";
import { getStoredAuthToken } from "@/lib/auth";
import { useRobotFetch } from "@/hooks/useRobotFetch";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const Index = () => {
  const [showApiModal, setShowApiModal] = useState(false);
  const [showChangeApiModal, setShowChangeApiModal] = useState(false);
  const [currentApiName, setCurrentApiName] = useState("");
  const hasCheckedRef = useRef(false);
  
  // Fetch robots on page load to get robot_name
  useRobotFetch();

  useEffect(() => {
    // Only run check once on mount to avoid repeated renders
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    // Check if all auth-related data is missing
    const authToken = getStoredAuthToken();
    const userId = localStorage.getItem("user_id");
    const userName = localStorage.getItem("user_name");
    const loginTimestamp = localStorage.getItem("login_timestamp");
    const apiConfigured = isApiConfigured();

    // Check cookies for any auth data
    const cookies = document.cookie;
    const hasAuthCookie = cookies.includes("token") || 
                          cookies.includes("auth") || 
                          cookies.includes("session");

    // If all auth data is missing AND API is not configured, show the modal
    const noAuthData = !authToken && !userId && !userName && !loginTimestamp && !hasAuthCookie;
    
    if (noAuthData && !apiConfigured) {
      setShowApiModal(true);
    }

    // Get current API name for pre-filling
    const config = getStoredApiConfig();
    if (config?.apiName) {
      setCurrentApiName(config.apiName);
    }
  }, []);

  const handleApiConfigured = () => {
    setShowApiModal(false);
    // Update current API name after configuration
    const config = getStoredApiConfig();
    if (config?.apiName) {
      setCurrentApiName(config.apiName);
    }
  };

  const handleChangeApiName = () => {
    // Clear all cookies
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });

    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Open the same API Config modal
    setShowChangeApiModal(true);
  };

  const handleChangeApiConfigured = () => {
    setShowChangeApiModal(false);
    // Update current API name after change
    const config = getStoredApiConfig();
    if (config?.apiName) {
      setCurrentApiName(config.apiName);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* API Config Modal - shown after logout when all auth data is cleared */}
      {showApiModal && <ApiConfigModal onConfigured={handleApiConfigured} />}

      {/* Change API Modal - reuses same component with controlled mode */}
      <ApiConfigModal 
        open={showChangeApiModal} 
        onOpenChange={setShowChangeApiModal}
        onConfigured={handleChangeApiConfigured}
        prefillApiName={currentApiName}
      />

      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          width: '100%',
          height: '100vh'
        }}
      />
      
      {/* Semi-transparent Overlay */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ 
          backgroundColor: '#351c7526',
          width: '100%',
          height: '100%'
        }}
      />

      {/* Change API Name Button - positioned at top-right */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="outline"
          onClick={handleChangeApiName}
          className="bg-white/90 hover:bg-white text-gray-700 border-gray-200 shadow-md backdrop-blur-sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          Change API Name
        </Button>
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen py-8">
        <LoginForm />
      </div>
    </div>
  );
};

export default Index;
