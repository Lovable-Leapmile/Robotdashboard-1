import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Zap } from "lucide-react";

const AUTH_TOKEN = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc";

interface PowerRecord {
  id: number;
  voltage: number;
  current: number;
  max_demand_active_power: number;
  total_active_energy_kwh: number;
  created_at: string;
}

interface ChartDataPoint {
  time: string;
  voltage: number;
  current: number;
  power: number;
}

export const PowerHistoryChart = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPowerHistory = async () => {
    try {
      const response = await fetch(
        "https://amsstores1.leapmile.com/robotmanager/robot_power?today=true&num_records=20",
        {
          headers: { 
            "Authorization": AUTH_TOKEN, 
            "Content-Type": "application/json" 
          }
        }
      );
      
      const data = await response.json();
      
      if (data.status === "success" && data.records && data.records.length > 0) {
        const formattedData: ChartDataPoint[] = data.records
          .reverse()
          .map((record: PowerRecord) => {
            const date = new Date(record.created_at);
            return {
              time: date.toLocaleTimeString("en-IN", { 
                hour: "2-digit", 
                minute: "2-digit",
                hour12: false 
              }),
              voltage: record.voltage ?? 0,
              current: record.current ?? 0,
              power: record.max_demand_active_power ?? 0
            };
          });
        setChartData(formattedData);
      } else {
        // No data available - show empty state
        setChartData([]);
      }
    } catch (error) {
      console.error("Error fetching power history:", error);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPowerHistory();
    const interval = setInterval(fetchPowerHistory, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
      <CardHeader className="pb-2 pt-3 px-4 border-b border-amber-500/20">
        <CardTitle className="text-sm font-bold text-amber-600 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Power History (Today)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 px-2 pb-3">
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            No power data available for today
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                domain={['auto', 'auto']}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="voltage" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#f59e0b' }}
                activeDot={{ r: 5 }}
                name="Voltage (V)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="current" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#3b82f6' }}
                activeDot={{ r: 5 }}
                name="Current (A)"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="power" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#10b981' }}
                activeDot={{ r: 5 }}
                name="Power (kW)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};