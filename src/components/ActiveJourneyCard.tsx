import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { JOURNEY_FOCUSES, captureIsDue, nextCaptureDate } from "@/lib/journey";
import { journeyService } from "@/lib/journeyService";

function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return "";
}

export function ActiveJourneyCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [label, setLabel] = useState<string | null>(null);
  const [detail, setDetail] = useState("Choose a focus and take your baseline photos.");
  const [action, setAction] = useState("Start a journey");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const journey = await journeyService.getActive();
        if (cancelled) return;
        if (!journey) {
          setLabel(null);
          setDetail("Choose a focus and take your baseline photos.");
          setAction("Start a journey");
          return;
        }
        const checkins = await journeyService.listCheckins(journey.id);
        if (cancelled) return;
        const title = JOURNEY_FOCUSES.find((item) => item.id === journey.focus)?.title ?? "Your journey";
        const dates = checkins.map((row) => row.takenOn);
        const next = nextCaptureDate(dates);
        setLabel(title);
        setDetail(captureIsDue(dates) ? "Your next pose set is due." : `Next photos ${next ?? "soon"}.`);
        setAction("Open journey");
      } catch (err: unknown) {
        if (cancelled) return;
        const message = errorMessage(err);
        if (/journeys|schema cache|does not exist|PGRST205/i.test(message)) {
          setLabel("Setup needed");
          setDetail("Apply the journey migration, then start here.");
          setAction("Open journey");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-primary/15 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Journey</p>
        <p className="font-semibold text-[#10233f]">{label ?? "No active journey"}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
      <Button size="sm" onClick={() => navigate("/journey")}>{action}</Button>
    </div>
  );
}
