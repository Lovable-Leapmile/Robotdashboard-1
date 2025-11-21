import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Calendar, Package, Smartphone } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <AppHeader selectedTab="APK Link" />
      
      <main className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Admin App Section */}
        <section>
          <h1 className="text-3xl font-bold mb-6 text-primary">Admin App</h1>
          <Card className="border-primary/20 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Version 1.0</CardTitle>
              <CardDescription>Latest Admin Application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Updated on: 12-June-2025</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">APK Size: 83 MB</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm">System Support: Android</span>
                </div>
              </div>
              <Button 
                className="w-full md:w-auto bg-primary hover:bg-primary/90"
                onClick={() => window.open('https://ams-bucket.blr1.cdn.digitaloceanspaces.com/admin-app-v35.apk', '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download APK
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Store App Section */}
        <section>
          <h1 className="text-3xl font-bold mb-6 text-primary">Store App</h1>
          
          {/* Version 4.0 - Latest with highlights */}
          <Card className="border-accent/30 shadow-md hover:shadow-lg transition-shadow mb-6 bg-gradient-to-br from-card to-accent/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl text-accent">Version 4.0</CardTitle>
                <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full font-semibold">
                  Latest Release
                </span>
              </div>
              <CardDescription>Enhanced features and improved workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Updated on: 20-Sep-2025</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">APK Size: 60 MB</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm">System Support: Android</span>
                </div>
              </div>

              {/* Update Highlights */}
              <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                <h3 className="font-semibold text-accent mb-3 flex items-center gap-2">
                  🚀 Latest Update Highlights
                </h3>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li>• Easily track pending orders in one place.</li>
                  <li>• View available trays in the station instantly.</li>
                  <li>• Search by Item ID or Tray ID to call trays on demand.</li>
                  <li>• Quick request option for empty trays.</li>
                  <li>• Access complete transaction history anytime.</li>
                  <li>• Scan trays at the picking station for faster drop/pickup.</li>
                  <li>• New smooth flow: Select/scan tray → Choose Drop or Pickup → Confirm Item ID → Add Quantity → Submit.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 bg-accent hover:bg-accent/90"
                  onClick={() => window.open('https://amsstores1.leapmile.com:6500/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Web App
                </Button>
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => window.open('https://ams-bucket.blr1.cdn.digitaloceanspaces.com/Ams-Stores-v4-release.apk', '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download APK
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Version 3.0 */}
          <Card className="border-primary/20 shadow-md hover:shadow-lg transition-shadow mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Version 3.0</CardTitle>
              <CardDescription>Previous stable release</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Updated on: 23-June-2025</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">APK Size: 73 MB</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm">System Support: Android</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open('https://amsstores1.leapmile.com:5700/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Web App
                </Button>
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => window.open('https://ams-bucket.blr1.cdn.digitaloceanspaces.com/Ams-Stores-v3-release.apk', '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download APK
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Version 2.0 */}
          <Card className="border-primary/20 shadow-md hover:shadow-lg transition-shadow mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Version 2.0</CardTitle>
              <CardDescription>Archived version</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Updated on: 12-June-2025</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">APK Size: 72 MB</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm">System Support: Android</span>
                </div>
              </div>
              <Button 
                className="w-full md:w-auto bg-primary hover:bg-primary/90"
                onClick={() => window.open('https://ams-bucket.blr1.cdn.digitaloceanspaces.com/Ams-Stores-v2-release.apk', '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download APK
              </Button>
            </CardContent>
          </Card>

          {/* Version 1.0 */}
          <Card className="border-primary/20 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Version 1.0</CardTitle>
              <CardDescription>Initial release</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Updated on: 09-May-2025</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">APK Size: 72 MB</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm">System Support: Android</span>
                </div>
              </div>
              <Button 
                className="w-full md:w-auto bg-primary hover:bg-primary/90"
                onClick={() => window.open('https://ams-bucket.blr1.cdn.digitaloceanspaces.com/Ams-App-V1-release.apk', '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download APK
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default ApkLink;
