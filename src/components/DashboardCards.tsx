import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bot, Package, Layers, Zap, Activity, Flame, Battery } from "lucide-react";

const AUTH_TOKEN = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc";

interface RobotInfo {
  robot_name: string;
  robot_num_rows: number;
  robot_num_racks: number;
  robot_num_slots: number;
  robot_num_depths: number;
  updated_at: string;
}

interface SlotInfo {
  totalSlots: number;
  occupiedSlots: number;
  freeSlots: number;
  occupiedPercent: number;
}

interface TrayInfo {
  totalTrays: number;
  occupiedTrays: number;
  freeTrays: number;
  occupiedPercent: number;
}

interface PowerInfo {
  voltage: string;
  current: string;
  power: string;
  energy: string;
  updatedAt: string | null;
}

export const DashboardCards = () => {
  const [robotInfo, setRobotInfo] = useState<RobotInfo | null>(null);
  const [slotInfo, setSlotInfo] = useState<SlotInfo | null>(null);
  const [trayInfo, setTrayInfo] = useState<TrayInfo | null>(null);
  const [powerInfo, setPowerInfo] = useState<PowerInfo | null>(null);

  const formatToIST = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const fetchRobotInfo = async () => {
    try {
      const response = await fetch("https://amsstores1.leapmile.com/robotmanager/robots", {
        headers: { "Authorization": AUTH_TOKEN, "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (data.records && data.records.length > 0) {
        setRobotInfo(data.records[0]);
      }
    } catch (error) {
      console.error("Error fetching robot info:", error);
    }
  };

  const fetchSlotInfo = async () => {
    try {
      const [slotsResponse, traysResponse] = await Promise.all([
        fetch("https://amsstores1.leapmile.com/robotmanager/slots_count?slot_status=active", {
          headers: { "Authorization": AUTH_TOKEN, "Content-Type": "application/json" }
        }),
        fetch("https://amsstores1.leapmile.com/robotmanager/trays?tray_status=active", {
          headers: { "Authorization": AUTH_TOKEN, "Content-Type": "application/json" }
        })
      ]);

      const slotsData = await slotsResponse.json();
      const traysData = await traysResponse.json();

      const totalSlots = slotsData.records?.[0]?.total_count || 0;
      const occupiedSlots = traysData.records ? traysData.records.length : 0;
      const freeSlots = totalSlots - occupiedSlots;
      const occupiedPercent = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

      setSlotInfo({ totalSlots, occupiedSlots, freeSlots, occupiedPercent });
    } catch (error) {
      console.error("Error fetching slot info:", error);
    }
  };

  const fetchTrayInfo = async () => {
    try {
      const [occupiedResponse, freeResponse] = await Promise.all([
        fetch("https://amsstores1.leapmile.com/nanostore/occupied_trays?occupied=true", {
          headers: { "Authorization": AUTH_TOKEN, "Content-Type": "application/json" }
        }),
        fetch("https://amsstores1.leapmile.com/nanostore/occupied_trays?occupied=false", {
          headers: { "Authorization": AUTH_TOKEN, "Content-Type": "application/json" }
        })
      ]);

      const occupiedData = await occupiedResponse.json();
      const freeData = await freeResponse.json();

      const occupiedTrays = occupiedData.records?.[0]?.count || 0;
      const freeTrays = freeData.records?.[0]?.count || 0;
      const totalTrays = occupiedTrays + freeTrays;
      const occupiedPercent = totalTrays > 0 ? (occupiedTrays / totalTrays) * 100 : 0;

      setTrayInfo({ totalTrays, occupiedTrays, freeTrays, occupiedPercent });
    } catch (error) {
      console.error("Error fetching tray info:", error);
    }
  };

  const fetchPowerInfo = async () => {
    try {
      // First try to fetch today's data
      let response = await fetch("https://amsstores1.leapmile.com/robotmanager/robot_power?today=true&num_records=1", {
        headers: { "Authorization": AUTH_TOKEN, "Content-Type": "application/json" }
      });
      let data = await response.json();
      
      // If today's data is not available, fetch the most recent data regardless of date
      if (data.status !== "success" || !data.records || data.records.length === 0) {
        response = await fetch("https://amsstores1.leapmile.com/robotmanager/robot_power?num_records=1", {
          headers: { "Authorization": AUTH_TOKEN, "Content-Type": "application/json" }
        });
        data = await response.json();
      }
      
      if (data.status === "success" && data.records && data.records.length > 0) {
        const record = data.records[0];
        setPowerInfo({
          voltage: `${record.voltage ?? 'N/A'} V`,
          current: `${record.current ?? 'N/A'} A`,
          power: `${record.max_demand_active_power ?? 'N/A'} kW`,
          energy: `${record.total_active_energy_kwh ?? 'N/A'} kWh`,
          updatedAt: record.updated_at || null
        });
      } else {
        // No data available at all
        setPowerInfo({
          voltage: "N/A",
          current: "N/A",
          power: "N/A",
          energy: "N/A",
          updatedAt: null
        });
      }
    } catch (error) {
      console.error("Error fetching power info:", error);
      setPowerInfo({
        voltage: "N/A",
        current: "N/A",
        power: "N/A",
        energy: "N/A",
        updatedAt: null
      });
    }
  };

  const fetchAllData = () => {
    fetchRobotInfo();
    fetchSlotInfo();
    fetchTrayInfo();
    fetchPowerInfo();
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 3600000); // 1 hour
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-3 mt-[15px]">
      {/* Robot Information Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 h-[250px] flex flex-col">
        <CardHeader className="pb-2 pt-3 px-4 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Robot Information
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-3 px-4 pb-3 flex-1 flex flex-col justify-between overflow-hidden">
          {robotInfo ? (
            <div className="space-y-2">
              <div className="bg-background/50 rounded-lg p-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-muted-foreground">Name</span>
                  <span className="text-xs font-bold text-primary truncate ml-2">{robotInfo.robot_name}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-border/50">
                  <div className="text-center p-1.5 bg-background/80 rounded">
                    <div className="text-xs text-muted-foreground">Rows</div>
                    <div className="text-base font-bold text-foreground">{robotInfo.robot_num_rows}</div>
                  </div>
                  <div className="text-center p-1.5 bg-background/80 rounded">
                    <div className="text-xs text-muted-foreground">Racks</div>
                    <div className="text-base font-bold text-foreground">{robotInfo.robot_num_racks}</div>
                  </div>
                  <div className="text-center p-1.5 bg-background/80 rounded">
                    <div className="text-xs text-muted-foreground">Slots</div>
                    <div className="text-base font-bold text-foreground">{robotInfo.robot_num_slots}</div>
                  </div>
                  <div className="text-center p-1.5 bg-background/80 rounded">
                    <div className="text-xs text-muted-foreground">Depth</div>
                    <div className="text-base font-bold text-foreground">{robotInfo.robot_num_depths}</div>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground text-center bg-background/30 rounded py-0.5 px-2">
                Updated: {formatToIST(robotInfo.updated_at)}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-2 text-sm">Loading...</div>
          )}
        </CardContent>
      </Card>

      {/* Slot Information Card */}
      <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20 h-[250px] flex flex-col">
        <CardHeader className="pb-2 pt-3 px-4 border-b border-blue-500/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-blue-600 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Slot Information
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-3 px-4 pb-3 flex-1 flex flex-col justify-between overflow-hidden">
          {slotInfo ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{slotInfo.totalSlots}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Total Slots</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-500/10 rounded-lg p-2 text-center border border-blue-500/20">
                  <div className="text-xl font-bold text-blue-600">{slotInfo.occupiedSlots}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Occupied</div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-2 text-center border border-green-500/20">
                  <div className="text-xl font-bold text-green-600">{slotInfo.freeSlots}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Free</div>
                </div>
              </div>
              <div className="bg-background/50 rounded-lg p-2 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">Occupancy Rate</span>
                  <span className="text-xs font-bold text-foreground">{slotInfo.occupiedPercent.toFixed(1)}%</span>
                </div>
                <Progress value={slotInfo.occupiedPercent} className="h-1.5" />
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-2 text-sm">Loading...</div>
          )}
        </CardContent>
      </Card>

      {/* Tray Information Card */}
      <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20 h-[250px] flex flex-col">
        <CardHeader className="pb-2 pt-3 px-4 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-purple-600 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Tray Information
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-3 px-4 pb-3 flex-1 flex flex-col justify-between overflow-hidden">
          {trayInfo ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{trayInfo.totalTrays}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Total Trays</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-purple-500/10 rounded-lg p-2 text-center border border-purple-500/20">
                  <div className="text-xl font-bold text-purple-600">{trayInfo.occupiedTrays}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Occupied</div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-2 text-center border border-green-500/20">
                  <div className="text-xl font-bold text-green-600">{trayInfo.freeTrays}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Free</div>
                </div>
              </div>
              <div className="bg-background/50 rounded-lg p-2 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">Occupancy Rate</span>
                  <span className="text-xs font-bold text-foreground">{trayInfo.occupiedPercent.toFixed(1)}%</span>
                </div>
                <Progress value={trayInfo.occupiedPercent} className="h-1.5" />
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-2 text-sm">Loading...</div>
          )}
        </CardContent>
      </Card>

      {/* Robot Power Card */}
      <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20 h-[250px] flex flex-col">
        <CardHeader className="pb-2 pt-3 px-4 border-b border-amber-500/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-amber-600 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Power Information
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-3 px-4 pb-3 flex-1 flex flex-col justify-between overflow-hidden">
          {powerInfo ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background/50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
                    <Zap className="w-3 h-3" />
                    Voltage
                  </div>
                  <div className="text-lg font-bold text-foreground">{powerInfo.voltage}</div>
                </div>
                <div className="bg-background/50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
                    <Activity className="w-3 h-3" />
                    Current
                  </div>
                  <div className="text-lg font-bold text-foreground">{powerInfo.current}</div>
                </div>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-2 border border-amber-500/20">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Flame className="w-3 h-3" />
                    Power
                  </span>
                  <span className="text-lg font-bold text-amber-600">{powerInfo.power}</span>
                </div>
              </div>
              <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Battery className="w-3 h-3" />
                    Total Energy
                  </span>
                  <span className="text-lg font-bold text-green-600">{powerInfo.energy}</span>
                </div>
              </div>
              {powerInfo.updatedAt && (
                <div className="text-[10px] text-muted-foreground text-right mt-1">
                  Updated: {new Date(powerInfo.updatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-2 text-sm">Loading...</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
