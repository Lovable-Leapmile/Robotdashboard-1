import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

interface SlotDetails {
  slot_id: string;
  slot_name: string;
  slot_status: string;
  slot_height: number;
  tags: string[];
  tray_id: string | null;
  updated_at: string;
}

interface SlotDetailsPanelProps {
  slotDetails: SlotDetails | null;
  isVisible: boolean;
}

const SlotDetailsPanel = ({ slotDetails, isVisible }: SlotDetailsPanelProps) => {
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [qrTitle, setQrTitle] = useState("");

  if (!isVisible || !slotDetails) return null;

  const showQrCode = (value: string, title: string) => {
    setQrValue(value);
    setQrTitle(title);
    setQrDialogOpen(true);
  };

  const hasStation = slotDetails.tags?.includes("station");
  const hasTray = slotDetails.tray_id !== null && slotDetails.tray_id !== "";

  const formattedDate = slotDetails.updated_at 
    ? format(new Date(slotDetails.updated_at), "PPp")
    : "N/A";

  return (
    <>
      <div 
        className="animate-slide-in-right"
        style={{ 
          width: '280px',
          marginLeft: '30px',
          borderRadius: '5px'
        }}
      >
        <div className="text-xl font-semibold mb-6" style={{ color: '#351c75' }}>
          Slot Details
        </div>
        <div className="space-y-4">
          {/* Slot ID Section */}
          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-muted-foreground min-w-fit">Slot ID:</span>
                <span className="text-base font-semibold flex-1 text-right" style={{ color: '#351c75' }}>
                  {slotDetails.slot_id}
                </span>
                <button
                  onClick={() => showQrCode(slotDetails.slot_id, "Slot ID")}
                  className="p-2 hover:bg-muted rounded-md transition-colors flex-shrink-0"
                  aria-label="Show QR Code"
                >
                  <QrCode className="h-5 w-5" style={{ color: '#351c75' }} />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Combined Tray + Station Section */}
          {hasTray && hasStation && (
            <Card>
              <CardContent className="py-3 px-4">
                <div className="space-y-3">
                {/* Tray Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Tray ID:</span>
                    </div>
                    <span className="text-base font-semibold flex-1 text-right" style={{ color: '#351c75' }}>
                      {slotDetails.tray_id}
                    </span>
                    <button
                      onClick={() => showQrCode(slotDetails.tray_id!, "Tray ID")}
                      className="p-2 hover:bg-muted rounded-md transition-colors flex-shrink-0"
                      aria-label="Show QR Code"
                    >
                      <QrCode className="h-5 w-5" style={{ color: '#351c75' }} />
                    </button>
                  </div>
                  
                {/* Station Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Station:</span>
                    </div>
                    <span className="text-base font-semibold flex-1 text-right" style={{ color: '#351c75' }}>
                      {slotDetails.slot_name}
                    </span>
                    <button
                      onClick={() => showQrCode(slotDetails.slot_name, "Station")}
                      className="p-2 hover:bg-muted rounded-md transition-colors flex-shrink-0"
                      aria-label="Show QR Code"
                    >
                      <QrCode className="h-5 w-5" style={{ color: '#351c75' }} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tray ID Section (only when station doesn't exist) */}
          {hasTray && !hasStation && (
            <Card>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground min-w-fit">Tray ID:</span>
                  </div>
                  <span className="text-base font-semibold flex-1 text-right" style={{ color: '#351c75' }}>
                    {slotDetails.tray_id}
                  </span>
                  <button
                    onClick={() => showQrCode(slotDetails.tray_id!, "Tray ID")}
                    className="p-2 hover:bg-muted rounded-md transition-colors flex-shrink-0"
                    aria-label="Show QR Code"
                  >
                    <QrCode className="h-5 w-5" style={{ color: '#351c75' }} />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Station Section (only when tray doesn't exist) */}
          {hasStation && !hasTray && (
            <Card>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground min-w-fit">Station:</span>
                  </div>
                  <span className="text-base font-semibold flex-1 text-right" style={{ color: '#351c75' }}>
                    {slotDetails.slot_name}
                  </span>
                  <button
                    onClick={() => showQrCode(slotDetails.slot_name, "Station")}
                    className="p-2 hover:bg-muted rounded-md transition-colors flex-shrink-0"
                    aria-label="Show QR Code"
                  >
                    <QrCode className="h-5 w-5" style={{ color: '#351c75' }} />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium capitalize">{slotDetails.slot_status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Slot Height</span>
                <span className="text-sm font-medium">{slotDetails.slot_height}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className="text-sm font-medium capitalize">
                  {slotDetails.tags?.[0] || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Updated At</span>
                <span className="text-sm font-medium">{formattedDate}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent 
          className="p-0 gap-0" 
          style={{ 
            width: '275px', 
            maxWidth: '275px',
            height: '335px',
            background: 'linear-gradient(135deg, #f3f0ff 0%, #ffffff 100%)',
            border: '2px solid #351c75'
          }}
        >
          {/* Row 1: Title with close button */}
          <div className="flex items-center justify-center relative px-6 pt-6 pb-2.5">
            <DialogTitle className="text-lg font-semibold text-center" style={{ color: '#351c75' }}>
              {qrTitle}
            </DialogTitle>
          </div>

          {/* Row 2: QR Code */}
          <div className="flex items-center justify-center pt-2.5 pb-4">
            <div className="bg-white p-3 rounded-lg shadow-lg">
              <QRCodeSVG 
                value={qrValue} 
                size={160} 
                level="H"
                fgColor="#351c75"
                bgColor="#ffffff"
              />
            </div>
          </div>

          {/* Row 3: Value Text */}
          <div className="flex items-center justify-center px-6 pb-6 pt-2">
            <div className="text-center text-sm font-bold" style={{ color: '#351c75' }}>
              {qrValue}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SlotDetailsPanel;
