import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bot, Package, Layers, Zap } from "lucide-react";

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

      const totalSlots = slotsData.total_count || 0;
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
      const response = await fetch("https://amsstores1.leapmile.com/robotmanager/robot_power?today=true&num_records=1", {
        headers: { "Authorization": AUTH_TOKEN, "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (data.records && data.records.length > 0) {
        const record = data.records[0];
        setPowerInfo({
          voltage: `${record.voltage} V`,
          current: `${record.current} A`,
          power: `${record.max_demand_active_power} kW`,
          energy: `${record.total_active_energy_kwh} kWh`
        });
      }
    } catch (error) {
      console.error("Error fetching power info:", error);
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
    <div className="grid grid-cols-2 gap-3 mt-[15px]">
      {/* Robot Information Card */}
      <Card className="bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            Robot Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-xs">
          {robotInfo ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-semibold text-foreground truncate ml-2">{robotInfo.robot_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Rows:</span>
                <span className="font-semibold text-foreground">{robotInfo.robot_num_rows}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Racks:</span>
                <span className="font-semibold text-foreground">{robotInfo.robot_num_racks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Slots:</span>
                <span className="font-semibold text-foreground">{robotInfo.robot_num_slots}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Depth:</span>
                <span className="font-semibold text-foreground">{robotInfo.robot_num_depths}</span>
              </div>
              <div className="pt-1.5 mt-1.5 border-t border-border">
                <span className="text-[10px] text-muted-foreground block truncate">
                  Updated: {formatToIST(robotInfo.updated_at)}
                </span>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">Loading...</div>
          )}
        </CardContent>
      </Card>

      {/* Slot Information Card */}
      <Card className="bg-gradient-to-br from-background to-blue-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            Slot Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-xs">
          {slotInfo ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold text-foreground">{slotInfo.totalSlots}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Occupied:</span>
                <span className="font-semibold text-blue-600">{slotInfo.occupiedSlots}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Free:</span>
                <span className="font-semibold text-green-600">{slotInfo.freeSlots}</span>
              </div>
              <div className="pt-1.5 mt-1.5 space-y-1 border-t border-border">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground">Occupied</span>
                  <span className="font-semibold text-foreground">{slotInfo.occupiedPercent.toFixed(1)}%</span>
                </div>
                <Progress value={slotInfo.occupiedPercent} className="h-1.5" />
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">Loading...</div>
          )}
        </CardContent>
      </Card>

      {/* Tray Information Card */}
      <Card className="bg-gradient-to-br from-background to-purple-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            Tray Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-xs">
          {trayInfo ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold text-foreground">{trayInfo.totalTrays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Occupied:</span>
                <span className="font-semibold text-purple-600">{trayInfo.occupiedTrays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Free:</span>
                <span className="font-semibold text-green-600">{trayInfo.freeTrays}</span>
              </div>
              <div className="pt-1.5 mt-1.5 space-y-1 border-t border-border">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground">Occupied</span>
                  <span className="font-semibold text-foreground">{trayInfo.occupiedPercent.toFixed(1)}%</span>
                </div>
                <Progress value={trayInfo.occupiedPercent} className="h-1.5" />
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">Loading...</div>
          )}
        </CardContent>
      </Card>

      {/* Robot Power Card */}
      <Card className="bg-gradient-to-br from-background to-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            Power Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-xs">
          {powerInfo ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Voltage:</span>
                <span className="font-semibold text-foreground">{powerInfo.voltage}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current:</span>
                <span className="font-semibold text-foreground">{powerInfo.current}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Power:</span>
                <span className="font-semibold text-amber-600">{powerInfo.power}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Energy:</span>
                <span className="font-semibold text-green-600">{powerInfo.energy}</span>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">Loading...</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
