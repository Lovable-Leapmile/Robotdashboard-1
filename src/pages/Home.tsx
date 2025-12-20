import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { RobotStateTimeline } from "@/components/RobotStateTimeline";
import { DashboardCards } from "@/components/DashboardCards";
import { useAuthSession } from "@/hooks/useAuthSession";
import esLeft from "@/assets/es-left.png";
import esRight from "@/assets/es-right.png";
import tsLeft from "@/assets/ts-left.png";
import tsRight from "@/assets/ts-right.png";

interface ShuttleData {
  row: number;
  rack: number;
  depth: number;
  slot: number;
  tray_id: string | null;
  direction: "left" | "right";
  action: string;
  status: string;
}

interface HighlightedRack {
  row: number;
  rack: number;
  depth: number;
  slot: number;
  type: "source" | "destination";
}

const Home = () => {
  useAuthSession(); // Session validation
  const [userName, setUserName] = useState("");
  const [robotNumRacks, setRobotNumRacks] = useState(0);
  const [robotNumSlots, setRobotNumSlots] = useState(0);
  const [robotNumDepths, setRobotNumDepths] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shuttleData, setShuttleData] = useState<ShuttleData[]>([]);
  const [activeShuttle, setActiveShuttle] = useState<ShuttleData | null>(null);
  const [highlightedRacks, setHighlightedRacks] = useState<HighlightedRack[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

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

  // Fetch shuttle data from pubsub API
  useEffect(() => {
    const fetchShuttleData = async () => {
      try {
        const response = await fetch(
          "https://amsstores1.leapmile.com/pubsub/subscribe?topic=amsstores1-AMSSTORES1-Nano&num_records=10",
          {
            method: "GET",
            headers: {
              Authorization:
                "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc",
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch shuttle data");
        }

        const data = await response.json();
        console.log("Shuttle API Response:", data);

        if (data.records && data.records.length > 0) {
          // Get first 2 records
          const firstTwoRecords = data.records.slice(0, 2);
          const parsedShuttles: ShuttleData[] = firstTwoRecords.map((record: any) => {
            const message = typeof record.message === "string" ? JSON.parse(record.message) : record.message;

            return {
              row: message.row ?? 0,
              rack: message.rack ?? 0,
              depth: message.depth ?? 0,
              slot: message.slot ?? 0,
              tray_id: message.tray_id ?? null,
              direction: message.direction ?? "right",
              action: message.action ?? "store",
              status: message.status ?? "start",
            };
          });

          setShuttleData(parsedShuttles);
          console.log("Parsed Shuttle Data:", parsedShuttles);
        }
      } catch (error) {
        console.error("Error fetching shuttle data:", error);
      }
    };

    fetchShuttleData();
    const interval = setInterval(fetchShuttleData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Parallel process logic with smooth animations
  useEffect(() => {
    if (shuttleData.length === 0) return;

    const runParallelProcesses = async () => {
      // Parallel Function 1: store start -> store stop
      const parallelFunc1 = async () => {
        const storeStartRecords = shuttleData.filter((s) => s.action === "store" && s.status === "start");
        if (storeStartRecords.length > 0) {
          const shuttle = storeStartRecords[0];
          setIsAnimating(true);
          setActiveShuttle(shuttle);
          setHighlightedRacks([
            { row: shuttle.row, rack: shuttle.rack, depth: shuttle.depth, slot: shuttle.slot, type: "source" },
          ]);
          console.log("Parallel 1 - Store Start:", shuttle);

          // Wait for initial positioning
          await new Promise((resolve) => setTimeout(resolve, 300));

          const storeStopRecords = shuttleData.filter((s) => s.action === "store" && s.status === "stop");
          if (storeStopRecords.length > 0) {
            const destShuttle = storeStopRecords[0];

            // Update destination highlight
            setHighlightedRacks((prev) => [
              ...prev,
              {
                row: destShuttle.row,
                rack: destShuttle.rack,
                depth: destShuttle.depth,
                slot: destShuttle.slot,
                type: "destination",
              },
            ]);

            // Animate shuttle to destination
            await new Promise((resolve) => setTimeout(resolve, 500));
            setActiveShuttle(destShuttle);
            console.log("Parallel 1 - Store Stop:", destShuttle);

            // Wait for animation to complete
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Fade out and clear
            setIsAnimating(false);
            await new Promise((resolve) => setTimeout(resolve, 300));
            setActiveShuttle(null);
            setHighlightedRacks([]);
          }
        }
      };

      // Parallel Function 2: retrieve stop -> store start
      const parallelFunc2 = async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const retrieveStopRecords = shuttleData.filter((s) => s.action === "retrieve" && s.status === "stop");
        if (retrieveStopRecords.length > 0) {
          const shuttle = retrieveStopRecords[0];
          console.log("Parallel 2 - Retrieve Stop:", shuttle);

          await new Promise((resolve) => setTimeout(resolve, 1500));

          const storeStartRecords = shuttleData.filter((s) => s.action === "store" && s.status === "start");
          if (storeStartRecords.length > 0) {
            const storeShuttle = storeStartRecords[0];
            console.log("Parallel 2 - Store Start:", storeShuttle);
          }
        }
      };

      // Run both parallel functions
      await Promise.all([parallelFunc1(), parallelFunc2()]);
    };

    runParallelProcesses();
  }, [shuttleData]);

  const fetchRobotConfig = async () => {
    try {
      const response = await fetch("https://amsstores1.leapmile.com/robotmanager/robots", {
        method: "GET",
        headers: {
          Authorization:
            "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc",
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
        setRobotNumSlots(robotConfig.robot_num_slots || 0);
        setRobotNumDepths(robotConfig.robot_num_depths || 0);
      }
    } catch (error) {
      console.error("Error fetching robot configuration:", error);
    }
  };

  const getShuttleImage = () => {
    if (!activeShuttle) return null;

    const hasTray = activeShuttle.tray_id !== null;
    const isLeft = activeShuttle.direction === "left";

    if (hasTray && isLeft) return tsLeft;
    if (hasTray && !isLeft) return tsRight;
    if (!hasTray && isLeft) return esLeft;
    return esRight;
  };

  const isRackHighlighted = (row: number, rack: number, depth: number, slot: number) => {
    return highlightedRacks.find((h) => h.row === row && h.rack === rack && h.depth === depth && h.slot === slot);
  };

  const getRackBorderStyle = (row: number, rack: number, depth: number, slot: number) => {
    const highlight = isRackHighlighted(row, rack, depth, slot);
    if (!highlight) return "1px solid #d1d5db";

    return highlight.type === "source" ? "2px solid #fbbf24" : "2px solid #34d399";
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
          <div className="flex gap-4 sm:gap-0 overflow-x-auto pb-4 lg:pb-0">
            {/* Row 1 */}
            <div className="flex flex-col items-center shrink-0" style={{ position: "relative" }}>
              <div className="flex gap-2 sm:gap-[10px]">
                {Array.from({ length: robotNumDepths }, (_, depthIdx) => (
                  <div key={`row1-depth${depthIdx}`} className="flex flex-col gap-2 sm:gap-[10px]">
                    {Array.from({ length: robotNumRacks }, (_, rackIdx) => (
                      <div
                        key={`row1-depth${depthIdx}-rack${rackIdx}`}
                        className="flex items-center justify-center transition-all duration-500 ease-in-out text-xs sm:text-sm font-medium w-[60px] h-[22px] sm:w-[75px] sm:h-[25px]"
                        style={{
                          backgroundColor: "#ffffff",
                          borderRadius: "4px",
                          border: getRackBorderStyle(1, rackIdx, depthIdx, 0),
                          color: "#351c75",
                          boxShadow: isRackHighlighted(1, rackIdx, depthIdx, 0)
                            ? "0 0 10px rgba(251, 191, 36, 0.3)"
                            : "none",
                        }}
                      >
                        {rackIdx}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Shuttle image for Row 1 */}
              {activeShuttle && activeShuttle.row === 1 && (
                <img
                  src={getShuttleImage()!}
                  alt="shuttle"
                  className={`${isAnimating ? "animate-scale-in" : "animate-fade-out"}`}
                  style={{
                    position: "absolute",
                    width: "75px",
                    height: "25px",
                    top: `${activeShuttle.rack * 35}px`,
                    left: `${activeShuttle.depth * 85}px`,
                    zIndex: 10,
                    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: isAnimating ? "scale(1)" : "scale(0.95)",
                    opacity: isAnimating ? 1 : 0,
                    filter: isAnimating ? "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" : "none",
                  }}
                />
              )}
            </div>

            {/* Row 0 */}
            <div className="flex flex-col items-center shrink-0 ml-4 sm:ml-[100px]" style={{ position: "relative" }}>
              <div className="flex gap-2 sm:gap-[10px]">
                {Array.from({ length: robotNumDepths }, (_, depthIdx) => (
                  <div key={`row0-depth${depthIdx}`} className="flex flex-col gap-2 sm:gap-[10px]">
                    {Array.from({ length: robotNumRacks }, (_, rackIdx) => (
                      <div
                        key={`row0-depth${depthIdx}-rack${rackIdx}`}
                        className="flex items-center justify-center transition-all duration-500 ease-in-out text-xs sm:text-sm font-medium w-[60px] h-[22px] sm:w-[75px] sm:h-[25px]"
                        style={{
                          backgroundColor: "#ffffff",
                          borderRadius: "4px",
                          border: getRackBorderStyle(0, rackIdx, depthIdx, 0),
                          color: "#351c75",
                          boxShadow: isRackHighlighted(0, rackIdx, depthIdx, 0)
                            ? "0 0 10px rgba(52, 211, 153, 0.3)"
                            : "none",
                        }}
                      >
                        {rackIdx}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Shuttle image for Row 0 */}
              {activeShuttle && activeShuttle.row === 0 && (
                <img
                  src={getShuttleImage()!}
                  alt="shuttle"
                  className={`${isAnimating ? "animate-scale-in" : "animate-fade-out"}`}
                  style={{
                    position: "absolute",
                    width: "75px",
                    height: "25px",
                    top: `${activeShuttle.rack * 35}px`,
                    left: `${activeShuttle.depth * 85}px`,
                    zIndex: 10,
                    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: isAnimating ? "scale(1)" : "scale(0.95)",
                    opacity: isAnimating ? 1 : 0,
                    filter: isAnimating ? "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" : "none",
                  }}
                />
              )}
            </div>
          </div>

          {/* Robot State Timeline with Dashboard Cards */}
          <div className="flex flex-col flex-1 lg:ml-[50px]">
            <RobotStateTimeline />
            <DashboardCards />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
