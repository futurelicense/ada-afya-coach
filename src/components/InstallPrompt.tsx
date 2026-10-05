import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "wefit_install_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "1");

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (dismissed || !deferred) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  const install = async () => {
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === "dismissed") dismiss();
  };

  return (
    <div
      className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-primary/15 bg-white p-3 shadow-lg md:bottom-6"
      role="dialog"
      aria-label="Install WeFit"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Download className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Add WeFit to your home screen</p>
        <p className="text-xs text-muted-foreground">Opens like an app, with your workouts saved on this phone.</p>
      </div>
      <Button size="sm" className="shrink-0" onClick={() => void install()}>Install</Button>
      <button type="button" className="rounded p-1 hover:bg-muted" onClick={dismiss} aria-label="Dismiss install prompt">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
