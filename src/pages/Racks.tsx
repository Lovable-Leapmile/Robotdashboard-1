import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import SlotDetailsPanel from "@/components/SlotDetailsPanel";
import { useAuthSession } from "@/hooks/useAuthSession";
import blockImg from "@/assets/block.png";
import stationImg from "@/assets/station.png";
import trayImg from "@/assets/tray.png";
import shuttleImg from "@/assets/shuttle.png";

interface Slot {
  slot_id: string;
  slot_name: string;
  slot_status: string;
  tags: string[];
  tray_id: string | null;
}

interface SlotDetails extends Slot {
  slot_height: number;
  updated_at: string;
}

const Racks = () => {
  useAuthSession(); // Session validation
  const [userName, setUserName] = useState("");
  const [numRacks, setNumRacks] = useState(0);
  const [selectedRack, setSelectedRack] = useState<number | null>(null);
  const [row1Depth1Slots, setRow1Depth1Slots] = useState<Slot[]>([]);
  const [row1Depth0Slots, setRow1Depth0Slots] = useState<Slot[]>([]);
  const [row0Depth1Slots, setRow0Depth1Slots] = useState<Slot[]>([]);
  const [row0Depth0Slots, setRow0Depth0Slots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [slotDetails, setSlotDetails] = useState<SlotDetails | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    setUserName(storedUserName);

    // Load selected rack from localStorage, default to 0
    const storedSelectedRack = localStorage.getItem("selected_rack");
    if (storedSelectedRack !== null) {
      setSelectedRack(parseInt(storedSelectedRack));
    } else {
      setSelectedRack(0);
      localStorage.setItem("selected_rack", "0");
    }

    fetchRobotConfig();
  }, [navigate]);

  useEffect(() => {
    if (selectedRack !== null) {
      fetchAllSlots(selectedRack);

      // Set up polling interval for 2 seconds
      const intervalId = setInterval(() => {
        fetchAllSlots(selectedRack);
      }, 2000);

      // Cleanup interval on unmount or when selectedRack changes
      return () => clearInterval(intervalId);
    }
  }, [selectedRack]);

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

      // Store robot configuration globally
      if (data.records && data.records.length > 0) {
        const robotConfig = data.records[0];
        const numRacksValue = robotConfig.robot_num_racks || 0;

        localStorage.setItem("robot_num_rows", robotConfig.robot_num_rows?.toString() || "0");
        localStorage.setItem("robot_num_racks", numRacksValue.toString());
        localStorage.setItem("robot_num_slots", robotConfig.robot_num_slots?.toString() || "0");
        localStorage.setItem("robot_num_depths", robotConfig.robot_num_depths?.toString() || "0");

        setNumRacks(numRacksValue);

        console.log("Robot configuration stored globally:", {
          robot_num_rows: robotConfig.robot_num_rows,
          robot_num_racks: numRacksValue,
          robot_num_slots: robotConfig.robot_num_slots,
          robot_num_depths: robotConfig.robot_num_depths,
        });
      }
    } catch (error) {
      console.error("Error fetching robot configuration:", error);
    }
  };

  const sortSlotsByIdDescending = (slots: Slot[]) => {
    return [...slots].sort((a, b) => {
      const aNum = parseInt(a.slot_id.split("-")[1] || "0");
      const bNum = parseInt(b.slot_id.split("-")[1] || "0");
      return bNum - aNum; // Descending order
    });
  };

  const fetchAllSlots = async (rackValue: number) => {
    const authToken =
      "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc";

    try {
      const [res1, res2, res3, res4] = await Promise.all([
        fetch(`https://amsstores1.leapmile.com/robotmanager/slots?row=1&depth=1&rack=${rackValue}`, {
          headers: { Authorization: authToken, "Content-Type": "application/json" },
        }),
        fetch(`https://amsstores1.leapmile.com/robotmanager/slots?row=1&depth=0&rack=${rackValue}`, {
          headers: { Authorization: authToken, "Content-Type": "application/json" },
        }),
        fetch(`https://amsstores1.leapmile.com/robotmanager/slots?row=0&depth=0&rack=${rackValue}`, {
          headers: { Authorization: authToken, "Content-Type": "application/json" },
        }),
        fetch(`https://amsstores1.leapmile.com/robotmanager/slots?row=0&depth=1&rack=${rackValue}`, {
          headers: { Authorization: authToken, "Content-Type": "application/json" },
        }),
      ]);

      const [data1, data2, data3, data4] = await Promise.all([res1.json(), res2.json(), res3.json(), res4.json()]);

      setRow1Depth1Slots(sortSlotsByIdDescending(data1.records || []));
      setRow1Depth0Slots(sortSlotsByIdDescending(data2.records || []));
      setRow0Depth1Slots(sortSlotsByIdDescending(data3.records || []));
      setRow0Depth0Slots(sortSlotsByIdDescending(data4.records || []));
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const handleRackSelect = (index: number) => {
    setSelectedRack(index);
    localStorage.setItem("selected_rack", index.toString());
    setSelectedSlotId(null);
    setSlotDetails(null);
  };

  const fetchSlotDetails = async (slotId: string) => {
    const authToken =
      "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDY1MzE0M30.asYhgMAOvrau4G6LI4V4IbgYZ022g_GX0qZxaS57GQc";

    try {
      const response = await fetch(`https://amsstores1.leapmile.com/robotmanager/slots?slot_id=${slotId}`, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch slot details");
      }

      const data = await response.json();
      if (data.records && data.records.length > 0) {
        setSlotDetails(data.records[0]);
      }
    } catch (error) {
      console.error("Error fetching slot details:", error);
    }
  };

  const handleSlotClick = (slotId: string) => {
    setSelectedSlotId(slotId);
    fetchSlotDetails(slotId);
  };

  // Auto-refresh slot details every 2 seconds when a slot is selected
  useEffect(() => {
    if (selectedSlotId) {
      const intervalId = setInterval(() => {
        fetchSlotDetails(selectedSlotId);
      }, 2000);

      return () => clearInterval(intervalId);
    }
  }, [selectedSlotId]);

  const SlotBox = ({ slot }: { slot: Slot }) => {
    const isInactive = slot.slot_status === "inactive";
    const isSelected = selectedSlotId === slot.slot_id;

    return (
      <div
        onClick={() => handleSlotClick(slot.slot_id)}
        className="relative flex flex-col items-center justify-center border rounded transition-all cursor-pointer hover:shadow-md w-[120px] h-[45px] sm:w-[150px] sm:h-[50px]"
        style={{
          borderColor: isSelected ? "#351c75" : "#d1d5db",
          borderWidth: isSelected ? "2px" : "1px",
          backgroundColor: isSelected ? "#f3f0ff" : "white",
        }}
      >
        {isInactive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={blockImg} alt="Inactive" className="w-full h-full object-cover rounded" />
          </div>
        )}
        <div className="text-xs font-medium relative z-10" style={{ color: "#351c75" }}>
          {slot.slot_id}
        </div>
        {!isInactive && (
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-1" style={{ gap: "1px" }}>
            {slot.tray_id && <img src={trayImg} alt="Tray" className="w-[116px] h-[8px] sm:w-[146px] sm:h-[10px]" />}
            {slot.tags?.includes("station") && (
              <img src={stationImg} alt="Station" className="w-[116px] h-[8px] sm:w-[146px] sm:h-[10px]" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fafafa" }}>
      <AppHeader selectedTab="Racks" />

      <div style={{ height: "10px" }} />

      <main className="p-3 sm:p-6">
        <div className="flex justify-center">
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {Array.from({ length: numRacks }, (_, index) => (
              <div
                key={index}
                onClick={() => handleRackSelect(index)}
                className="flex items-center justify-center font-medium text-xs sm:text-sm transition-all hover:scale-105 cursor-pointer w-8 h-8 sm:w-10 sm:h-10"
                style={{
                  backgroundColor: selectedRack === index ? "#ffffff" : "#351C75",
                  color: selectedRack === index ? "#351C75" : "white",
                  borderRadius: "4px",
                  border: selectedRack === index ? "2px solid #351C75" : "none",
                  boxShadow:
                    selectedRack === index ? "0 3px 6px rgba(53, 28, 117, 0.3)" : "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
              >
                {index}
              </div>
            ))}
          </div>
        </div>

        {selectedRack !== null && (
          <div className="flex justify-center mt-6 sm:mt-8 overflow-x-auto">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-5">
              {/* Row 1 Section */}
              <div className="flex items-end gap-2">
                {/* Picking Station Label - Directly in front of station containers */}
                <div
                  className="hidden lg:flex items-center justify-center px-2 py-3 rounded-l-lg font-semibold text-xs whitespace-nowrap"
                  style={{
                    backgroundColor: "#fef3c7",
                    border: "2px solid #351C75",
                    borderRight: "none",
                    color: "#351C75",
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    transform: "rotate(180deg)",
                    height: "118px",
                    marginBottom: "36px",
                  }}
                >
                  Picking Station
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6" style={{ color: "#351c75" }}>
                    Row 1
                  </div>
                  <div className="flex gap-2 sm:gap-[10px]">
                    {/* Depth 2 - Vertical Column (Left) */}
                    <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                      <div className="flex flex-col gap-2 sm:gap-2.5">
                        {row1Depth1Slots.map((slot, idx) => {
                          const isPickingStation = slot.tags?.includes("station");
                          const isLastTwo = idx >= row1Depth1Slots.length - 2;
                          const shouldHighlight = isPickingStation || isLastTwo;

                          return (
                            <div
                              key={`r1d1-${idx}`}
                              className={shouldHighlight ? "relative" : ""}
                              style={
                                shouldHighlight
                                  ? {
                                      backgroundColor: "#fef3c7",
                                      border: "2px solid #351C75",
                                      borderRadius: "8px",
                                      padding: "4px",
                                      margin: "-4px",
                                    }
                                  : {}
                              }
                            >
                              <SlotBox slot={slot} />
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-xs sm:text-sm font-medium mt-2" style={{ color: "#351c75" }}>
                        Depth 2
                      </div>
                    </div>
                    {/* Depth 1 - Vertical Column (Right) */}
                    <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                      <div className="flex flex-col gap-2 sm:gap-2.5">
                        {row1Depth0Slots.map((slot, idx) => {
                          const isPickingStation = slot.tags?.includes("station");
                          const isLastTwo = idx >= row1Depth0Slots.length - 2;
                          const shouldHighlight = isPickingStation || isLastTwo;

                          return (
                            <div
                              key={`r1d0-${idx}`}
                              className={shouldHighlight ? "relative" : ""}
                              style={
                                shouldHighlight
                                  ? {
                                      backgroundColor: "#fef3c7",
                                      border: "2px solid #351C75",
                                      borderRadius: "8px",
                                      padding: "4px",
                                      margin: "-4px",
                                    }
                                  : {}
                              }
                            >
                              <SlotBox slot={slot} />
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-xs sm:text-sm font-medium mt-2" style={{ color: "#351c75" }}>
                        Depth 1
                      </div>
                    </div>
                  </div>

                  {/* Mobile Picking Station Label */}
                  <div
                    className="lg:hidden mt-3 px-3 py-1.5 rounded-lg font-semibold text-xs"
                    style={{
                      backgroundColor: "#fef3c7",
                      border: "2px solid #351C75",
                      color: "#351C75",
                    }}
                  >
                    Picking Station
                  </div>
                </div>
              </div>

              {/* Shuttle Image between Row 1 and Row 0 */}
              <div className="flex items-center justify-center">
                <img
                  src={shuttleImg}
                  alt="Shuttle"
                  className="h-full object-contain"
                  style={{
                    opacity: 0.6,
                    height: `${Math.max(row1Depth1Slots.length, row0Depth1Slots.length) * 55}px`,
                  }}
                />
              </div>

              {/* Row 0 Section */}
              <div className="flex flex-col lg:flex-row">
                <div className="flex flex-col items-center">
                  <div className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6" style={{ color: "#351c75" }}>
                    Row 0
                  </div>
                  <div className="flex gap-2 sm:gap-[10px]">
                    {/* Depth 1 - Vertical Column (Left) */}
                    <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                      <div className="flex flex-col gap-2 sm:gap-2.5">
                        {row0Depth1Slots.map((slot, idx) => {
                          const isPickingStation = slot.tags?.includes("station");
                          const isLastTwo = idx >= row0Depth1Slots.length - 2;
                          const shouldHighlight = isPickingStation || isLastTwo;

                          return (
                            <div
                              key={`r0d1-${idx}`}
                              className={shouldHighlight ? "relative" : ""}
                              style={
                                shouldHighlight
                                  ? {
                                      backgroundColor: "#fef3c7",
                                      border: "2px solid #351C75",
                                      borderRadius: "8px",
                                      padding: "4px",
                                      margin: "-4px",
                                    }
                                  : {}
                              }
                            >
                              <SlotBox slot={slot} />
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-xs sm:text-sm font-medium mt-2" style={{ color: "#351c75" }}>
                        Depth 1
                      </div>
                    </div>
                    {/* Depth 2 - Vertical Column (Right) */}
                    <div className="flex flex-col items-center gap-2 sm:gap-2.5">
                      <div className="flex flex-col gap-2 sm:gap-2.5">
                        {row0Depth0Slots.map((slot, idx) => {
                          const isPickingStation = slot.tags?.includes("station");
                          const isLastTwo = idx >= row0Depth0Slots.length - 2;
                          const shouldHighlight = isPickingStation || isLastTwo;

                          return (
                            <div
                              key={`r0d0-${idx}`}
                              className={shouldHighlight ? "relative" : ""}
                              style={
                                shouldHighlight
                                  ? {
                                      backgroundColor: "#fef3c7",
                                      border: "2px solid #351C75",
                                      borderRadius: "8px",
                                      padding: "4px",
                                      margin: "-4px",
                                    }
                                  : {}
                              }
                            >
                              <SlotBox slot={slot} />
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-xs sm:text-sm font-medium mt-2" style={{ color: "#351c75" }}>
                        Depth 2
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slot Details Panel */}
                <SlotDetailsPanel slotDetails={slotDetails} isVisible={selectedSlotId !== null} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Racks;
