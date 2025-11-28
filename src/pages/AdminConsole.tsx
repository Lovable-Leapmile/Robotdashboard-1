import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";

const AdminConsole = () => {
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    setUserName(storedUserName);
    // Simulate loading time for the iframe
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fafafa" }}>
      <AppHeader selectedTab="Admin Console" />

      <main style={{ marginLeft: "15px", paddingTop: "20px", paddingBottom: "20px", paddingRight: "15px" }}>
        <div className="relative w-full" style={{ height: "calc(100vh - 115px)", minHeight: "600px" }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading Admin Console...</p>
              </div>
            </div>
          )}
          <iframe
            src="https://amsstores1.leapmile.com:5700/"
            className="w-full h-full border-0"
            title="Admin Console"
            onLoad={() => setIsLoading(false)}
            style={{
              width: "100%",
              height: "100%",
              border: "none"
            }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
          />
        </div>
      </main>
    </div>
  );
};

export default AdminConsole;
