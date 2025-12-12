import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, ExternalLink, Calendar, Package, Smartphone, Shield, Store, Search, ChevronDown, FileText } from "lucide-react";

interface AppVersion {
  appType: "admin" | "store";
  version: string;
  updatedOn: string;
  apkSize: string;
  downloadUrl: string;
  webUrl?: string;
  isLatest?: boolean;
  releaseNotes?: string[];
}

const appVersions: AppVersion[] = [
  {
    appType: "admin",
    version: "1.0",
    updatedOn: "12-June-2025",
    apkSize: "83 MB",
    downloadUrl: "https://ams-bucket.blr1.cdn.digitaloceanspaces.com/admin-app-v35.apk",
    releaseNotes: [
      "Initial release of Admin App",
      "Complete admin dashboard functionality",
      "User management features",
      "System configuration options"
    ]
  },
  {
    appType: "store",
    version: "4.0",
    updatedOn: "20-Sep-2025",
    apkSize: "60 MB",
    downloadUrl: "https://ams-bucket.blr1.cdn.digitaloceanspaces.com/Ams-Stores-v4-release.apk",
    webUrl: "https://amsstores1.leapmile.com:6500/",
    isLatest: true,
    releaseNotes: [
      "Easily track pending orders in one place.",
      "View available trays in the station instantly.",
      "Search by Item ID or Tray ID to call trays on demand.",
      "Quick request option for empty trays.",
      "Access complete transaction history anytime.",
      "Scan trays at the picking station for faster drop/pickup.",
      "New smooth flow: Select/scan tray → Choose Drop or Pickup → Confirm Item ID → Add Quantity → Submit."
    ]
  },
  {
    appType: "store",
    version: "3.0",
    updatedOn: "23-June-2025",
    apkSize: "73 MB",
    downloadUrl: "https://ams-bucket.blr1.cdn.digitaloceanspaces.com/Ams-Stores-v3-release.apk",
    webUrl: "https://amsstores1.leapmile.com:5700/",
    releaseNotes: [
      "Improved tray scanning accuracy",
      "Enhanced transaction history view",
      "Bug fixes and performance improvements",
      "Updated UI for better user experience"
    ]
  },
  {
    appType: "store",
    version: "2.0",
    updatedOn: "12-June-2025",
    apkSize: "72 MB",
    downloadUrl: "https://ams-bucket.blr1.cdn.digitaloceanspaces.com/Ams-Stores-v2-release.apk",
    releaseNotes: [
      "Added tray management features",
      "Improved order tracking system",
      "Enhanced station visibility",
      "Performance optimizations"
    ]
  },
  {
    appType: "store",
    version: "1.0",
    updatedOn: "09-May-2025",
    apkSize: "72 MB",
    downloadUrl: "https://ams-bucket.blr1.cdn.digitaloceanspaces.com/Ams-App-V1-release.apk",
    releaseNotes: [
      "Initial release of Store App",
      "Basic order management",
      "Tray scanning functionality",
      "Station integration"
    ]
  }
];

const ApkLink = () => {
  const [userName, setUserName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedVersions, setExpandedVersions] = useState<string[]>([]);
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

  const toggleVersion = (key: string) => {
    setExpandedVersions(prev => 
      prev.includes(key) ? prev.filter(v => v !== key) : [...prev, key]
    );
  };

  const filteredVersions = appVersions.filter(app => {
    const query = searchQuery.toLowerCase();
    return (
      app.version.toLowerCase().includes(query) ||
      app.appType.toLowerCase().includes(query) ||
      app.updatedOn.toLowerCase().includes(query) ||
      (app.releaseNotes?.some(note => note.toLowerCase().includes(query)))
    );
  });

  const adminApps = filteredVersions.filter(app => app.appType === "admin");
  const storeApps = filteredVersions.filter(app => app.appType === "store");

  const getCardStyle = (app: AppVersion) => {
    if (app.isLatest) {
      return "bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20";
    }
    if (app.appType === "store" && app.version === "3.0") {
      return "bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20";
    }
    return "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20";
  };

  const getBorderStyle = (app: AppVersion) => {
    if (app.isLatest) return "border-purple-500/20";
    if (app.appType === "store" && app.version === "3.0") return "border-blue-500/20";
    return "border-primary/20";
  };

  const renderVersionCard = (app: AppVersion) => {
    const versionKey = `${app.appType}-${app.version}`;
    const isExpanded = expandedVersions.includes(versionKey);

    return (
      <Card key={versionKey} className={`${getCardStyle(app)} shadow-sm`}>
        <CardHeader className={`pb-3 pt-4 px-5 border-b ${getBorderStyle(app)}`}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
              Version {app.version}
              {app.isLatest && (
                <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-semibold">
                  Latest Release
                </span>
              )}
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
                    <div className="text-sm font-semibold text-foreground">{app.updatedOn}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">APK Size</div>
                    <div className="text-sm font-semibold text-foreground">{app.apkSize}</div>
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

            {/* Release Notes - Collapsible */}
            {app.releaseNotes && app.releaseNotes.length > 0 && (
              <Collapsible open={isExpanded} onOpenChange={() => toggleVersion(versionKey)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto bg-background/50 hover:bg-background/80 border border-border/50"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <FileText className="h-4 w-4" />
                      Release Notes
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className={`rounded-lg p-3 border ${app.isLatest ? 'bg-purple-500/10 border-purple-500/20' : 'bg-primary/5 border-primary/20'}`}>
                    <ul className="space-y-1.5 text-sm text-foreground/80">
                      {app.releaseNotes.map((note, index) => (
                        <li key={index}>• {note}</li>
                      ))}
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              {app.webUrl && (
                <Button
                  variant="outline"
                  className="flex-1 border-purple-500/40 hover:bg-purple-500/25"
                  onClick={() => window.open(app.webUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Web App
                </Button>
              )}
              <Button
                className={`${app.webUrl ? 'flex-1' : 'w-full md:w-auto'} bg-primary hover:bg-primary/90 text-white`}
                onClick={() => window.open(app.downloadUrl, "_blank")}
              >
                <Download className="h-4 w-4 mr-2" />
                Download APK
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fafafa" }}>
      <AppHeader selectedTab="APK Link" />

      <main className="px-3 sm:px-4 py-4 sm:py-5">
        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by version, app type, date, or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border/50 focus:border-primary"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {filteredVersions.length} result{filteredVersions.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Admin App Section */}
        {adminApps.length > 0 && (
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold text-primary">Admin App</h1>
            </div>
            <div className="space-y-4">
              {adminApps.map(renderVersionCard)}
            </div>
          </section>
        )}

        {/* Store App Section */}
        {storeApps.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Store className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold text-primary">Store App</h1>
            </div>
            <div className="space-y-4">
              {storeApps.map(renderVersionCard)}
            </div>
          </section>
        )}

        {/* No Results */}
        {filteredVersions.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No versions found matching "{searchQuery}"</p>
            <Button
              variant="ghost"
              className="mt-2 text-primary"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ApkLink;
