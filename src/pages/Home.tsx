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
          {/* Rack visualization with shuttle between rows */}
          <div className="flex gap-4 sm:gap-0 overflow-x-auto pb-4 lg:pb-0">
            {/* Combined Row 1 and Row 0 with shuttle in between */}
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

              {/* Shuttle track and image container - positioned BETWEEN Row 1 and Row 0 */}
              <div 
                className="flex flex-col justify-start ml-2 sm:ml-4 mr-2 sm:mr-4"
                style={{ 
                  minWidth: "55px",
                  position: "relative",
                }}
              >
                {/* Vertical track line - spans full height with low opacity */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 0,
                    bottom: 0,
                    width: "2px",
                    transform: "translateX(-50%)",
                    backgroundColor: "#6b7280",
                    opacity: 0.25,
                    zIndex: 0,
                  }}
                />
                
                {Array.from({ length: robotNumRacks }, (_, rackIdx) => (
                  <div
                    key={`shuttle-slot-${rackIdx}`}
                    className="flex items-center justify-center"
                    style={{
                      height: "25px",
                      marginTop: rackIdx === 0 ? "0" : "10px",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {isShuttleVisibleForRack(rackIdx) && (
                      <img
                        src={getShuttleImageForRack(rackIdx)!}
                        alt="shuttle"
                        style={{
                          width: "55px",
                          height: "25px",
                          objectFit: "contain",
                          transition: "all 0.3s ease-in-out",
                        }}
                      />
                    )}
                  </div>
                ))}
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
