import { useEffect, useState } from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Cell, Tooltip } from "recharts";

interface RobotState {
  status: string;
  created_at: string;
}

const STATUS_COLORS = {
  active: "#10b981",
  idle: "#f59e0b",
  maintenance: "#3b82f6",
  error: "#ef4444"
};

const STATUS_LABELS = ["error", "maintenance", "idle", "active"];

export const RobotStateTimeline = () => {
  const [data, setData] = useState<Array<{ time: number; status: number; statusName: string }>>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchRobotState = async () => {
    try {
      const response = await fetch(
        "https://amsstores1.leapmile.com/robotmanager/robot_state?today=true&num_records=100&offset=0",
        {
          method: "GET",
          headers: {
            "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc",
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch robot state");
      }

      const result = await response.json();
      
      if (result.records && result.records.length > 0) {
        console.log("Robot state records:", result.records);
        
        const chartData = result.records.map((record: RobotState) => {
          const date = new Date(record.created_at);
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const timeValue = hours + minutes / 60;
          
          const statusName = record.status.toLowerCase();
          const statusIndex = STATUS_LABELS.indexOf(statusName);
          
          return {
            time: timeValue,
            status: statusIndex >= 0 ? statusIndex : 0,
            statusName
          };
        }).filter((item: { time: number }) => item.time >= 8 && item.time <= 18);
        
        console.log("Filtered chart data:", chartData);
        setData(chartData);
      }
    } catch (error) {
      console.error("Error fetching robot state:", error);
    }
  };

  useEffect(() => {
    fetchRobotState();
    const interval = setInterval(fetchRobotState, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeLabels = Array.from({ length: 11 }, (_, i) => 8 + i);

  return (
    <div className="flex flex-col" style={{ flex: 1, marginTop: '15px' }}>
      <div className="flex justify-center items-center mb-4" style={{ gap: '24px' }}>
        <div className="text-xl font-semibold" style={{ color: '#351c75' }}>
          Robot Status Timeline
        </div>
        <div className="text-sm" style={{ color: '#9ca3af' }}>
          {currentTime.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
        </div>
      </div>
      
      <div style={{ height: '280px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 30, bottom: 40, left: 80 }}>
            <XAxis
              type="number"
              dataKey="time"
              domain={[8, 18]}
              ticks={timeLabels}
              tickFormatter={(value) => `${value}:00`}
              label={{ value: 'Time of Day', position: 'bottom', offset: 20, style: { fill: '#351c75', fontSize: 13 } }}
              tick={{ fill: '#351c75', fontSize: 12 }}
            />
            <YAxis
              type="number"
              domain={[0, 3]}
              ticks={[0, 1, 2, 3]}
              tickFormatter={(value) => STATUS_LABELS[value].charAt(0).toUpperCase() + STATUS_LABELS[value].slice(1)}
              tick={{ fill: '#351c75', fontSize: 13 }}
              width={70}
            />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div style={{ 
                      backgroundColor: '#ffffff', 
                      padding: '8px', 
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}>
                      <div style={{ color: '#351c75', fontSize: '12px', fontWeight: '500' }}>
                        {data.statusName.charAt(0).toUpperCase() + data.statusName.slice(1)}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '11px' }}>
                        {Math.floor(data.time)}:{String(Math.round((data.time % 1) * 60)).padStart(2, '0')}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={data} fill="#8884d8" shape="circle">
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={STATUS_COLORS[entry.statusName as keyof typeof STATUS_COLORS]}
                  r={6}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center mt-2" style={{ gap: '24px' }}>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center" style={{ gap: '6px' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: color,
              borderRadius: '2px'
            }} />
            <span style={{ color: '#351c75', fontSize: '13px' }}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
