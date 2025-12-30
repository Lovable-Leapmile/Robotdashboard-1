import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useAuthSession } from "@/hooks/useAuthSession";
import { getAdminConsoleUrl } from "@/lib/api";

const AdminConsole = () => {
  useAuthSession();
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [adminUrl, setAdminUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    setUserName(storedUserName);
    setAdminUrl(getAdminConsoleUrl());
    // Simulate loading time for the iframe
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fafafa" }}>
      <AppHeader selectedTab="Admin Console" />

      <main className="p-2 sm:p-4">
        <div className="relative w-full" style={{ height: "calc(100vh - 130px)", minHeight: "400px" }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading Admin Console...</p>
              </div>
            </div>
          )}
          <iframe
            src={adminUrl}
            className="w-full h-full border-0 rounded-lg"
            title="Admin Console"
            onLoad={() => setIsLoading(false)}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
          />
        </div>
      </main>
    </div>
  );
};

export default AdminConsole;
