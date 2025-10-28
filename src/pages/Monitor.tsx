import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";

const Monitor = () => {
  const [monitorUrl, setMonitorUrl] = useState("");

  useEffect(() => {
    const robotId = "AMSSTORES1-Nano";
    setMonitorUrl(`https://amsstores1.leapmile.com:5870/detail.html?robot_id=${robotId}`);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader selectedTab="Monitor" />
      <main className="flex-1">
        {monitorUrl && (
          <iframe
            src={monitorUrl}
            className="w-full h-[calc(100vh-110px)]"
            title="Monitor Details"
          />
        )}
      </main>
    </div>
  );
};

export default Monitor;
