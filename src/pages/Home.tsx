import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";

const Home = () => {
  const [userName, setUserName] = useState("");
  const [robotNumRacks, setRobotNumRacks] = useState(0);
  const [robotNumSlots, setRobotNumSlots] = useState(0);
  const [robotNumDepths, setRobotNumDepths] = useState(0);
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
        <div className="flex" style={{ gap: '40px' }}>
          {/* Row 0 */}
          <div className="flex flex-col items-center">
            <div className="text-xl font-semibold mb-4" style={{ color: '#351c75' }}>
              Row 0
            </div>
            <div className="flex" style={{ gap: '10px' }}>
              {Array.from({ length: robotNumDepths }, (_, depthIdx) => (
                <div key={`row0-depth${depthIdx}`} className="flex flex-col" style={{ gap: '10px' }}>
                  {Array.from({ length: robotNumRacks }, (_, rackIdx) => (
                    <div
                      key={`row0-depth${depthIdx}-rack${rackIdx}`}
                      style={{
                        width: '75px',
                        height: '25px',
                        backgroundColor: '#351C75',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db'
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Row 1 */}
          <div className="flex flex-col items-center">
            <div className="text-xl font-semibold mb-4" style={{ color: '#351c75' }}>
              Row 1
            </div>
            <div className="flex" style={{ gap: '10px' }}>
              {Array.from({ length: robotNumDepths }, (_, depthIdx) => (
                <div key={`row1-depth${depthIdx}`} className="flex flex-col" style={{ gap: '10px' }}>
                  {Array.from({ length: robotNumRacks }, (_, rackIdx) => (
                    <div
                      key={`row1-depth${depthIdx}-rack${rackIdx}`}
                      style={{
                        width: '75px',
                        height: '25px',
                        backgroundColor: '#351C75',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db'
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
