import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { RobotStateTimeline } from "@/components/RobotStateTimeline";
import { DashboardCards } from "@/components/DashboardCards";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useShuttlePubSub } from "@/hooks/useShuttlePubSub";
import { getStoredAuthToken } from "@/lib/auth";
import esLeft from "@/assets/es-left.png";
import esRight from "@/assets/es-right.png";

const Home = () => {
  useAuthSession();
  const [userName, setUserName] = useState("");
  const [robotNumRacks, setRobotNumRacks] = useState(0);
  const [robotNumDepths, setRobotNumDepths] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Use the PubSub hook for real-time shuttle tracking
  const { shuttleState } = useShuttlePubSub();

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    setUserName(storedUserName);
    fetchRobotConfig();
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchRobotConfig = async () => {
    try {
      const token = getStoredAuthToken();
      if (!token) return;

      const response = await fetch("https://amsstores1.leapmile.com/robotmanager/robots", {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch robot configuration");
      }

      const data = await response.json();

      if (data.records && data.records.length > 0) {
        const robotConfig = data.records[0];
        setRobotNumRacks(robotConfig.robot_num_racks || 0);
        setRobotNumDepths(robotConfig.robot_num_depths || 0);
      }
    } catch (error) {
      console.error("Error fetching robot configuration:", error);
    }
  };

  // Determine which shuttle image to show based on shuttle state
  const getShuttleImageForRack = (rackIndex: number): string | null => {
    const { store_row, store_rack, shuttle_action } = shuttleState;

    // Don't show if shuttle is moving (backward/forward)
    if (shuttle_action === "backward" || shuttle_action === "forward") {
      return null;
    }

    // Check if this rack should show the shuttle
    if (store_rack !== rackIndex) {
      return null;
    }

    // Row 0 shows es-right, Row 1 shows es-left
    if (store_row === 0) {
      return esRight;
    }
    if (store_row === 1) {
      return esLeft;
    }

    return null;
  };

  // Check if shuttle should be visible for a specific rack
  const isShuttleVisibleForRack = (rackIndex: number): boolean => {
    const { store_row, store_rack, shuttle_action } = shuttleState;

    if (shuttle_action === "backward" || shuttle_action === "forward") {
      return false;
    }

    if (store_rack !== rackIndex) {
      return false;
    }

    return store_row === 0 || store_row === 1;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fafafa" }}>
      <AppHeader selectedTab="Robot" />

      <main className="px-2 sm:px-4 py-4 sm:py-5 overflow-x-auto">
        {/* Header row with all titles */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-[100px] mb-4 px-2">
          <div className="flex items-center gap-4 sm:gap-[100px]">
            <div
              className="text-base sm:text-xl font-semibold text-center min-w-[80px] sm:min-w-[155px]"
              style={{ color: "#351c75" }}
            >
              Row 1
            </div>
            <div
              className="text-base sm:text-xl font-semibold text-center min-w-[80px] sm:min-w-[155px]"
              style={{ color: "#351c75" }}
            >
              Row 0
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="text-base sm:text-xl font-semibold" style={{ color: "#351c75" }}>
              Robot Status Timeline
            </div>
            <div className="text-xs sm:text-sm" style={{ color: "#9ca3af" }}>
              {currentTime.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}{" "}
              {currentTime.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}
            </div>
          </div>
        </div>

        {/* Content row */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-0">
          {/* Rack visualization with shuttle track between rows */}
          <div className="flex gap-4 sm:gap-0 overflow-x-auto pb-4 lg:pb-0">
            {/* Combined Row 1 and Row 0 with shuttle track in between */}
            <div className="flex shrink-0" style={{ position: "relative" }}>
              {/* Row 1 */}
              <div className="flex flex-col items-center">
                <div className="flex gap-2 sm:gap-[10px]">
                  {Array.from({ length: robotNumDepths }, (_, depthIdx) => (
                    <div key={`row1-depth${depthIdx}`} className="flex flex-col gap-2 sm:gap-[10px]">
                      {Array.from({ length: robotNumRacks }, (_, rackIdx) => (
                        <div
                          key={`row1-depth${depthIdx}-rack${rackIdx}`}
                          className="flex items-center justify-center text-xs sm:text-sm font-medium w-[60px] h-[22px] sm:w-[75px] sm:h-[25px]"
                          style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "4px",
                            border: "1px solid #d1d5db",
                            color: "#351c75",
                          }}
                        >
                          {rackIdx}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Shuttle Track Container - positioned BETWEEN Row 1 and Row 0 */}
              <div 
                className="flex flex-col ml-3 sm:ml-5 mr-3 sm:mr-5"
                style={{ 
                  minWidth: "60px",
                  position: "relative",
                }}
              >
                {Array.from({ length: robotNumRacks }, (_, rackIdx) => {
                  const rackHeight = 25; // Height of each rack cell
                  const gapHeight = rackIdx === 0 ? 0 : 10; // Gap between racks (matching gap-[10px])
                  
                  return (
                    <div
                      key={`shuttle-track-${rackIdx}`}
                      className="relative flex items-center justify-center"
                      style={{
                        height: `${rackHeight}px`,
                        marginTop: rackIdx === 0 ? "0" : `${gapHeight}px`,
                      }}
                    >
                      {/* Horizontal Track Line - always visible */}
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: "2px",
                          backgroundColor: "#6b7280",
                          opacity: 0.25,
                        }}
                      />
                      
                      {/* Shuttle Icon - positioned on track when active */}
                      {isShuttleVisibleForRack(rackIdx) && (
                        <img
                          src={getShuttleImageForRack(rackIdx)!}
                          alt="shuttle"
                          style={{
                            position: "relative",
                            zIndex: 10,
                            width: "55px",
                            height: "25px",
                            objectFit: "contain",
                            transition: "all 0.3s ease-in-out",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Row 0 */}
              <div className="flex flex-col items-center">
                <div className="flex gap-2 sm:gap-[10px]">
                  {Array.from({ length: robotNumDepths }, (_, depthIdx) => (
                    <div key={`row0-depth${depthIdx}`} className="flex flex-col gap-2 sm:gap-[10px]">
                      {Array.from({ length: robotNumRacks }, (_, rackIdx) => (
                        <div
                          key={`row0-depth${depthIdx}-rack${rackIdx}`}
                          className="flex items-center justify-center text-xs sm:text-sm font-medium w-[60px] h-[22px] sm:w-[75px] sm:h-[25px]"
                          style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "4px",
                            border: "1px solid #d1d5db",
                            color: "#351c75",
                          }}
                        >
                          {rackIdx}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Robot State Timeline with Dashboard Cards */}
          <div className="flex flex-col flex-1 lg:ml-[30px]">
            <RobotStateTimeline />
            <DashboardCards />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
