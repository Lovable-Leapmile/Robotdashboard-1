import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Calendar, Package, Smartphone, Shield, Store } from "lucide-react";

const ApkLink = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    setUserName(storedUserName);
  }, [navigate]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fafafa" }}>
      <AppHeader selectedTab="APK Link" />

      <main style={{ marginLeft: "15px", paddingTop: "20px", paddingBottom: "20px", paddingRight: "15px" }}>
        {/* Admin App Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Admin App</h1>
          </div>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm">
            <CardHeader className="pb-3 pt-4 px-5 border-b border-primary/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">Version 1.0</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-5 pb-4">
              <div className="space-y-4">
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Updated on</div>
                        <div className="text-sm font-semibold text-foreground">12-June-2025</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">APK Size</div>
                        <div className="text-sm font-semibold text-foreground">83 MB</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">System Support</div>
                        <div className="text-sm font-semibold text-foreground">Android</div>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full md:w-auto bg-primary hover:bg-primary/90"
                  onClick={() =>
                    window.open("https://ams-bucket.blr1.cdn.digitaloceanspaces.com/admin-app-v35.apk", "_blank")
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download APK
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Store App Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Store App</h1>
          </div>

          <div className="space-y-4">
            {/* Version 4.0 - Latest */}
            <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20 shadow-sm">
              <CardHeader className="pb-3 pt-4 px-5 border-b border-purple-500/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                    Version 4.0
                    <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-semibold">
                      Latest Release
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 px-5 pb-4">
                <div className="space-y-4">
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Updated on</div>
                          <div className="text-sm font-semibold text-foreground">20-Sep-2025</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">APK Size</div>
                          <div className="text-sm font-semibold text-foreground">60 MB</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">System Support</div>
                          <div className="text-sm font-semibold text-foreground">Android</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Update Highlights */}
                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                    <h3 className="font-semibold text-purple-600 mb-2 text-md flex items-center gap-1">
                      🚀 Latest Update Highlights
                    </h3>
                    <ul className="space-y-1.5 text-sm text-foreground/80">
                      <li>• Easily track pending orders in one place.</li>
                      <li>• View available trays in the station instantly.</li>
                      <li>• Search by Item ID or Tray ID to call trays on demand.</li>
                      <li>• Quick request option for empty trays.</li>
                      <li>• Access complete transaction history anytime.</li>
                      <li>• Scan trays at the picking station for faster drop/pickup.</li>
                      <li>
                        • New smooth flow: Select/scan tray → Choose Drop or Pickup → Confirm Item ID → Add Quantity →
                        Submit.
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-purple-500/30 hover:bg-purple-500/10"
                      onClick={() => window.open("https://amsstores1.leapmile.com:6500/", "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Web App
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90 text-white"
                      onClick={() =>
                        window.open(
                          "https://ams-bucket.blr1.cdn.digitaloceanspaces.com/Ams-Stores-v4-release.apk",
                          "_blank",
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download APK
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Version 3.0 */}
            <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20 shadow-sm">
              <CardHeader className="pb-3 pt-4 px-5 border-b border-blue-500/20">
                <CardTitle className="text-base font-bold text-primary">Version 3.0</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-5 pb-4">
                <div className="space-y-3">
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Updated on</div>
                          <div className="text-sm font-semibold text-foreground">23-June-2025</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">APK Size</div>
                          <div className="text-sm font-semibold text-foreground">73 MB</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">System Support</div>
                          <div className="text-sm font-semibold text-foreground">Android</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-blue-500/30 hover:bg-blue-500/10"
                      onClick={() => window.open("https://amsstores1.leapmile.com:5700/", "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Web App
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90 text-white"
                      onClick={() =>
                        window.open(
                          "https://ams-bucket.blr1.cdn.digitaloceanspaces.com/Ams-Stores-v3-release.apk",
                          "_blank",
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download APK
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Version 2.0 */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm">
              <CardHeader className="pb-3 pt-4 px-5 border-b border-primary/20">
                <CardTitle className="text-base font-bold text-primary">Version 2.0</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-5 pb-4">
                <div className="space-y-3">
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Updated on</div>
                          <div className="text-sm font-semibold text-foreground">12-June-2025</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">APK Size</div>
                          <div className="text-sm font-semibold text-foreground">72 MB</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">System Support</div>
                          <div className="text-sm font-semibold text-foreground">Android</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full md:w-auto bg-primary hover:bg-primary/90"
                    onClick={() =>
                      window.open(
                        "https://ams-bucket.blr1.cdn.digitaloceanspaces.com/Ams-Stores-v2-release.apk",
                        "_blank",
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download APK
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Version 1.0 */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm">
              <CardHeader className="pb-3 pt-4 px-5 border-b border-primary/20">
                <CardTitle className="text-base font-bold text-primary">Version 1.0</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-5 pb-4">
                <div className="space-y-3">
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Updated on</div>
                          <div className="text-sm font-semibold text-foreground">09-May-2025</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">APK Size</div>
                          <div className="text-sm font-semibold text-foreground">72 MB</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">System Support</div>
                          <div className="text-sm font-semibold text-foreground">Android</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full md:w-auto bg-primary hover:bg-primary/90"
                    onClick={() =>
                      window.open("https://ams-bucket.blr1.cdn.digitaloceanspaces.com/Ams-App-V1-release.apk", "_blank")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download APK
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ApkLink;
