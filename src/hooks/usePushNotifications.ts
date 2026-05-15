import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/lib/analytics";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

export function usePushNotifications() {
  const { session } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!session || !("serviceWorker" in navigator) || !VAPID_PUBLIC_KEY) return false;

    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) { setSubscribed(true); return true; }

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return false;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const json = sub.toJSON();
      await supabase.from("push_subscriptions").upsert({
        user_id: session.user.id,
        endpoint: json.endpoint!,
        p256dh:   (json.keys as Record<string, string>).p256dh,
        auth:     (json.keys as Record<string, string>).auth,
      }, { onConflict: "user_id,endpoint" });

      setSubscribed(true);
      track.pushSubscribed();
      return true;
    } catch {
      return false;
    }
  }, [session]);

  const unsubscribe = useCallback(async () => {
    if (!session) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await supabase.from("push_subscriptions")
          .delete()
          .eq("user_id", session.user.id)
          .eq("endpoint", sub.endpoint);
      }
      setSubscribed(false);
    } catch {
      // ignore
    }
  }, [session]);

  return { permission, subscribed, subscribe, unsubscribe };
}
