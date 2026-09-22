import { useEffect, useState } from "react";
import { CloudOff, Download, RefreshCw, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const PUBLIC_ROUTES = new Set([
  "/", "/auth", "/reset-password", "/about", "/blog", "/careers",
  "/pricing", "/privacy", "/terms", "/security",
]);

export function AppStatusBanner() {
  const { pathname } = useLocation();
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [checking, setChecking] = useState(false);
  const usesAppShell = !PUBLIC_ROUTES.has(pathname) && !pathname.startsWith("/creator/");
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error("Service worker registration failed", error);
    },
  });

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  const retryConnection = async () => {
    setChecking(true);
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/health`, {
        method: "GET",
        cache: "no-store",
      });
      setIsOnline(true);
      window.location.reload();
    } catch {
      setIsOnline(navigator.onLine);
    } finally {
      setChecking(false);
    }
  };

  const bannerClass = cn("app-status-banner", !usesAppShell && "app-status-banner--flush");

  if (!isOnline) {
    return (
      <div className={`${bannerClass} bg-amber-500 text-black`} role="status" aria-live="polite">
        <CloudOff className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-sm font-medium">You’re offline. Saved screens may still work; live data will retry when connected.</span>
        <Button size="sm" variant="outline" className="h-8 border-black/30 bg-transparent hover:bg-black/10" onClick={retryConnection} disabled={checking}>
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />
          Try again
        </Button>
      </div>
    );
  }

  if (needRefresh) {
    return (
      <div className={`${bannerClass} bg-primary text-primary-foreground`} role="status" aria-live="polite">
        <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-sm font-medium">A new version of WeFit is ready.</span>
        <Button size="sm" variant="secondary" className="h-8" onClick={() => void updateServiceWorker(true)}>
          Update now
        </Button>
        <button className="rounded p-1 hover:bg-white/10" onClick={() => setNeedRefresh(false)} aria-label="Dismiss update">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (offlineReady) {
    return (
      <div className={`${bannerClass} bg-success text-success-foreground`} role="status" aria-live="polite">
        <span className="flex-1 text-sm font-medium">WeFit is ready to use offline.</span>
        <button className="rounded p-1 hover:bg-white/10" onClick={() => setOfflineReady(false)} aria-label="Dismiss offline-ready message">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return null;
}
