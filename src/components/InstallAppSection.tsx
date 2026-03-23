import { useEffect, useState } from "react";
import { Smartphone, Download, Share, MoreVertical, Plus, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallAppSection = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Smartphone className="w-4 h-4" />
              No App Store Needed
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Get ATLAAS GO on Your Phone
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Install directly from your browser — fast, lightweight, and works offline
            </p>
          </div>

          {deferredPrompt && (
            <div className="flex justify-center mb-6">
              <Button onClick={handleInstall} size="lg" className="gap-2">
                <Download className="w-5 h-5" />
                Install ATLAAS GO Now
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* iPhone */}
            <div className="bg-card rounded-2xl p-6 border">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-foreground text-background rounded-xl">
                  <Monitor className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">iPhone / iPad</h3>
              </div>
              <ol className="space-y-3">
                {[
                  { icon: <Monitor className="w-4 h-4" />, text: "Open this site in Safari" },
                  { icon: <Share className="w-4 h-4" />, text: "Tap the Share button" },
                  { icon: <Plus className="w-4 h-4" />, text: 'Tap "Add to Home Screen"' },
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-muted-foreground pt-1">{step.text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Android */}
            <div className="bg-card rounded-2xl p-6 border">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-accent/15 text-accent rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Android</h3>
              </div>
              <ol className="space-y-3">
                {[
                  { icon: <Monitor className="w-4 h-4" />, text: "Open this site in Chrome" },
                  { icon: <MoreVertical className="w-4 h-4" />, text: "Tap the Menu (⋮) button" },
                  { icon: <Download className="w-4 h-4" />, text: 'Tap "Install App" or "Add to Home Screen"' },
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-muted-foreground pt-1">{step.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstallAppSection;
