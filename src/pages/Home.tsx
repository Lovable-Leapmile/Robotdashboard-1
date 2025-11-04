import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { RobotStateTimeline } from "@/components/RobotStateTimeline";
import { DashboardCards } from "@/components/DashboardCards";
import tsLeft from "@/assets/ts-left.png";
import tsRight from "@/assets/ts-right.png";
import esLeft from "@/assets/es-left.png";
import esRight from "@/assets/es-right.png";

interface ShuttleData {
  row: number;
  rack: number;
  depth: number;
  slot: number;
  action: string;
  status: string;
  tray_id: string | null;
  direction: "left" | "right";
}

const Home = () => {
  const [userName, setUserName] = useState("");
  const [robotNumRacks, setRobotNumRacks] = useState(0);
  const [robotNumSlots, setRobotNumSlots] = useState(0);
  const [robotNumDepths, setRobotNumDepths] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shuttleData, setShuttleData] = useState<ShuttleData[]>([]);
  const [activeShuttle, setActiveShuttle] = useState<ShuttleData | null>(null);
  const [highlightedRacks, setHighlightedRacks] = useState<{
    source: { row: number; rack: number; depth: number } | null;
    destination: { row: number; rack: number; depth: number } | null;
  }>({ source: null, destination: null });
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

  useEffect(() => {
    const fetchShuttleData = async () => {
      try {
        const response = await fetch(
          "https://amsstores1.leapmile.com/pubsub/subscribe?topic=amsstores1-AMSSTORES1-Nano&num_records=10",
          {
            method: "GET",
            headers: {
              "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc",
              "Content-Type": "application/json"
            }
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch shuttle data");
        }

        const data = await response.json();
        
        if (data.records && data.records.length > 0) {
          const first2Records = data.records.slice(0, 2).map((record: any) => ({
            row: record.message?.row || 0,
            rack: record.message?.rack || 0,
            depth: record.message?.depth || 0,
            slot: record.message?.slot || 0,
            action: record.message?.action || "",
            status: record.message?.status || "",
            tray_id: record.message?.tray_id || null,
            direction: record.message?.direction || "right"
          }));
          setShuttleData(first2Records);
        }
      } catch (error) {
        console.error("Error fetching shuttle data:", error);
      }
    };

    fetchShuttleData();
    const interval = setInterval(fetchShuttleData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (shuttleData.length === 0) return;

    const processParallelA = async () => {
      const storeStart = shuttleData.find(
        (s) => s.action === "store" && s.status === "start"
      );
      if (storeStart) {
        setActiveShuttle(storeStart);
        setHighlightedRacks({
          source: { row: storeStart.row, rack: storeStart.rack, depth: storeStart.depth },
          destination: null
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const storeStop = shuttleData.find(
        (s) => s.action === "store" && s.status === "stop"
      );
      if (storeStop) {
        setActiveShuttle(storeStop);
        setHighlightedRacks(prev => ({
          ...prev,
          destination: { row: storeStop.row, rack: storeStop.rack, depth: storeStop.depth }
        }));
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        setActiveShuttle(null);
        setHighlightedRacks({ source: null, destination: null });
      }
    };

    const processParallelB = async () => {
      const retrieveStop = shuttleData.find(
        (s) => s.action === "retrieve" && s.status === "stop"
      );
      if (retrieveStop) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setActiveShuttle(retrieveStop);
        setHighlightedRacks({
          source: { row: retrieveStop.row, rack: retrieveStop.rack, depth: retrieveStop.depth },
          destination: null
        });
      }

      const storeStart = shuttleData.find(
        (s) => s.action === "store" && s.status === "start"
      );
      if (storeStart) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setActiveShuttle(storeStart);
        setHighlightedRacks(prev => ({
          ...prev,
          destination: { row: storeStart.row, rack: storeStart.rack, depth: storeStart.depth }
        }));
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        setActiveShuttle(null);
        setHighlightedRacks({ source: null, destination: null });
      }
    };

    Promise.all([processParallelA(), processParallelB()]);
  }, [shuttleData]);

  const getShuttleImage = () => {
    if (!activeShuttle) return null;

    const hasTray = activeShuttle.tray_id !== null;
    const isLeft = activeShuttle.direction === "left";

    if (hasTray && isLeft) return tsLeft;
    if (hasTray && !isLeft) return tsRight;
    if (!hasTray && isLeft) return esLeft;
    if (!hasTray && !isLeft) return esRight;
    
    return null;
  };

  const isRackHighlighted = (row: number, rackIdx: number, depthIdx: number) => {
    const { source, destination } = highlightedRacks;
    
    if (source && source.row === row && source.rack === rackIdx && source.depth === depthIdx) {
      return "source";
    }
    
    if (destination && destination.row === row && destination.rack === rackIdx && destination.depth === depthIdx) {
      return "destination";
    }
    
    return null;
  };

  const fetchRobotConfig = async () => {
    try {
      const response = await fetch("https://amsstores1.leapmile.com/robotmanager/robots", {
        method: "GET",
        headers: {
          "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc",
          "Content-Type": "application/json"
        }
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <AppHeader selectedTab="Robot" />
      
      <main style={{ marginLeft: '15px', paddingTop: '20px', paddingBottom: '20px' }}>
        {/* Header row with all titles */}
        <div className="flex items-center mb-4" style={{ gap: '100px', paddingLeft: '0' }}>
          <div className="text-xl font-semibold" style={{ color: '#351c75', width: '155px', textAlign: 'center' }}>
            Row 1
          </div>
          <div className="text-xl font-semibold" style={{ color: '#351c75', width: '155px', textAlign: 'center' }}>
            Row 0
          </div>
          <div className="flex items-center" style={{ gap: '24px' }}>
            <div className="text-xl font-semibold" style={{ color: '#351c75' }}>
              Robot Status Timeline
            </div>
            <div className="text-sm" style={{ color: '#9ca3af' }}>
              {currentTime.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </div>
          </div>
        </div>

        {/* Content row */}
        <div className="flex" style={{ gap: '100px' }}>
          {/* Row 1 */}
          <div className="flex flex-col items-center relative">
            <div className="flex" style={{ gap: '10px' }}>
              {Array.from({ length: robotNumDepths }, (_, depthIdx) => (
                <div key={`row1-depth${depthIdx}`} className="flex flex-col" style={{ gap: '10px' }}>
                  {Array.from({ length: robotNumRacks }, (_, rackIdx) => {
                    const highlight = isRackHighlighted(1, rackIdx, depthIdx);
                    return (
                      <div
                        key={`row1-depth${depthIdx}-rack${rackIdx}`}
                        className="flex items-center justify-center"
                        style={{
                          width: '75px',
                          height: '25px',
                          backgroundColor: '#ffffff',
                          borderRadius: '4px',
                          border: highlight === "source" 
                            ? '2px solid #fbbf24' 
                            : highlight === "destination" 
                            ? '2px solid #34d399' 
                            : '1px solid #d1d5db',
                          color: '#351c75',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'border 0.3s ease'
                        }}
                      >
                        {rackIdx}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {activeShuttle && activeShuttle.row === 1 && getShuttleImage() && (
              <img 
                src={getShuttleImage()!} 
                alt="Shuttle" 
                className="absolute"
                style={{
                  width: '120px',
                  height: 'auto',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  transition: 'all 0.5s ease'
                }}
              />
            )}
          </div>

          {/* Row 0 */}
          <div className="flex flex-col items-center relative">
            <div className="flex" style={{ gap: '10px' }}>
              {Array.from({ length: robotNumDepths }, (_, depthIdx) => (
                <div key={`row0-depth${depthIdx}`} className="flex flex-col" style={{ gap: '10px' }}>
                  {Array.from({ length: robotNumRacks }, (_, rackIdx) => {
                    const highlight = isRackHighlighted(0, rackIdx, depthIdx);
                    return (
                      <div
                        key={`row0-depth${depthIdx}-rack${rackIdx}`}
                        className="flex items-center justify-center"
                        style={{
                          width: '75px',
                          height: '25px',
                          backgroundColor: '#ffffff',
                          borderRadius: '4px',
                          border: highlight === "source" 
                            ? '2px solid #fbbf24' 
                            : highlight === "destination" 
                            ? '2px solid #34d399' 
                            : '1px solid #d1d5db',
                          color: '#351c75',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'border 0.3s ease'
                        }}
                      >
                        {rackIdx}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {activeShuttle && activeShuttle.row === 0 && getShuttleImage() && (
              <img 
                src={getShuttleImage()!} 
                alt="Shuttle" 
                className="absolute"
                style={{
                  width: '120px',
                  height: 'auto',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  transition: 'all 0.5s ease'
                }}
              />
            )}
          </div>

          {/* Robot State Timeline with Dashboard Cards */}
          <div className="flex flex-col" style={{ flex: 1 }}>
            <RobotStateTimeline />
            <DashboardCards />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
