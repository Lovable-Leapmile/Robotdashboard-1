import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { useAuthSession } from "@/hooks/useAuthSession";

const Reports = () => {
  useAuthSession();
  const [reportsUrl, setReportsUrl] = useState("");

  useEffect(() => {
    const robotId = "AMSSTORES1-Nano";
    setReportsUrl(`https://amsstores1.leapmile.com:5770/reports.html?robot_id=${robotId}`);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader selectedTab="" isReportsPage={true} />
      <main className="flex-1">
        {reportsUrl && (
          <iframe
            src={reportsUrl}
            className="w-full h-[calc(100vh-55px)]"
            title="Reports View"
          />
        )}
      </main>
    </div>
  );
};

export default Reports;
