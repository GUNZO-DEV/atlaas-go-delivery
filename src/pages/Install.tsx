import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Download, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-morocco flex items-center justify-center">
              <Smartphone className="w-12 h-12 text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">Install ATLAAS GO</h1>
            <p className="text-muted-foreground">
              Get the full app experience on your device
            </p>
          </div>
        </div>

        {isInstalled ? (
          <div className="space-y-4">
            <div className="bg-success/10 border border-success rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-semibold text-success">App Installed!</p>
                <p className="text-sm text-muted-foreground">
                  ATLAAS GO is now on your home screen
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/")} className="w-full" size="lg">
              Open App
            </Button>
          </div>
        ) : isInstallable ? (
          <div className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Works offline with cached data</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Fast loading and smooth performance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Install directly - no app store needed</span>
              </li>
            </ul>

            <Button onClick={handleInstall} className="w-full" size="lg">
              <Download className="w-5 h-5 mr-2" />
              Install App
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full"
            >
              Continue in Browser
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="font-semibold text-sm">How to install:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>On iPhone: Tap Share → Add to Home Screen</li>
                <li>On Android: Tap Menu → Install App</li>
              </ol>
            </div>

            <Button onClick={() => navigate("/")} className="w-full" size="lg">
              Continue to App
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Install;