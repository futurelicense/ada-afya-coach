import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAnalytics } from "./lib/analytics";

initAnalytics();

// A production PWA service worker can otherwise keep serving an older cached UI
// while running Vite locally. Development should always reflect the current source.
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) =>
    Promise.all(registrations.map((registration) => registration.unregister())),
  );
  if ("caches" in window) {
    void caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key))),
    );
  }
}

createRoot(document.getElementById("root")!).render(<App />);
