import { useEffect, useMemo, useState } from "react";
import { Camera, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import {
  Equipment,
  JOURNEY_FOCUSES,
  JourneyFocus,
  POSE_LABELS,
  Pose,
  addDays,
  baselineAndLatest,
  captureIsDue,
  formatMeasureDelta,
  measureDelta,
  nextCaptureDate,
  poseComparisons,
  posesForFocus,
} from "@/lib/journey";
import {
  JourneyCheckin,
  JourneyDraft,
  JourneyRecord,
  journeyService,
} from "@/lib/journeyService";
import { ProgressPhoto } from "@/lib/progressPhotoService";
import { JourneyMarketplace } from "@/components/JourneyMarketplace";
import { cn } from "@/lib/utils";

type Step = "focus" | "details" | "poses";

const EQUIPMENT: Array<{ id: Equipment; label: string }> = [
  { id: "home", label: "Home" },
  { id: "gym", label: "Gym" },
  { id: "both", label: "Home and gym" },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function messageOf(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return fallback;
}

export default function Journey() {
  const { user } = useAuth();
  const { profile } = useUserData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [journey, setJourney] = useState<JourneyRecord | null>(null);
  const [completed, setCompleted] = useState<JourneyRecord | null>(null);
  const [checkins, setCheckins] = useState<JourneyCheckin[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [sessions, setSessions] = useState(0);
  const [starting, setStarting] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [buildingWeek, setBuildingWeek] = useState(false);

  const reload = async () => {
    setSchemaMissing(false);
    try {
      const active = await journeyService.getActive();
      const shown = active ?? await journeyService.getLatestCompleted();
      setJourney(active);
      setCompleted(active ? null : shown);
      if (shown) {
        const ended = shown.status === "completed" && shown.updatedAt ? shown.updatedAt.slice(0, 10) : today();
        const [rows, shots, done] = await Promise.all([
          journeyService.listCheckins(shown.id),
          journeyService.listPhotos(shown.id),
          journeyService.countCompletedSessions(shown.startedOn, ended),
        ]);
        setCheckins(rows);
        setPhotos(shots);
        setSessions(done);
      } else {
        setCheckins([]);
        setPhotos([]);
        setSessions(0);
      }
    } catch (err: unknown) {
      const message = messageOf(err, "Could not load your journey.");
      if (/journeys|schema cache|does not exist/i.test(message)) setSchemaMissing(true);
      else toast({ variant: "destructive", title: "Could not load your journey", description: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    void reload();
  }, [user?.id]);

  const due = captureIsDue(checkins.map((row) => row.takenOn));
  const nextDate = nextCaptureDate(checkins.map((row) => row.takenOn));

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (schemaMissing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Journey setup is not on the database yet</CardTitle>
          <CardDescription>
            Apply supabase/migrations/022_journeys.sql, then open this page again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (starting || (!journey && !completed)) {
    return (
      <JourneyWizard
        defaultWeight={profile?.weight || 70}
        defaultHeight={profile?.height || 170}
        defaultLevel={profile?.fitnessLevel || "intermediate"}
        onCancel={completed ? () => setStarting(false) : undefined}
        onCreated={async () => {
          setStarting(false);
          setCompleted(null);
          setLoading(true);
          await reload();
        }}
      />
    );
  }

  const record = journey ?? completed;
  if (!record) return null;

  if (journey && checkingIn) {
    return (
      <CheckinForm
        journey={journey}
        onCancel={() => setCheckingIn(false)}
        onSaved={async () => {
          setCheckingIn(false);
          setLoading(true);
          await reload();
        }}
      />
    );
  }

  const focus = JOURNEY_FOCUSES.find((item) => item.id === record.focus);
  const archived = record.status === "completed";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="font-display text-3xl font-black text-[#10233f]">{focus?.title ?? "Your journey"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {archived ? "Completed. The baseline, latest check-in, and finished sessions stay on this record." : focus?.summary}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Started" value={record.startedOn} />
        <Stat label="Target date" value={record.targetOn ?? "Open"} />
        <Stat label={archived ? "Photos" : "Next photos"} value={archived ? `${checkins.length} sets` : (nextDate ?? "After the baseline")} />
        <Stat label="Sessions done" value={String(sessions)} />
      </div>

      <JourneyComparison focus={record.focus} checkins={checkins} photos={photos} nextDate={nextDate} />

      {journey ? <JourneyMarketplace journeyId={journey.id} focus={journey.focus} /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Baseline and check-ins</CardTitle>
          <CardDescription>
            {record.weightKg ?? "—"} kg
            {record.waistCm ? ` · waist ${record.waistCm} cm` : ""}
            {record.heightCm ? ` · ${record.heightCm} cm` : ""}
            {" · "}
            {record.equipment === "both" ? "home and gym" : record.equipment}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checkins.map((checkin) => {
            const shots = photos.filter((photo) => photo.checkinId === checkin.id);
            return (
              <div key={checkin.id}>
                <p className="text-sm font-semibold">
                  {checkin.kind === "baseline" ? "Baseline" : "Check-in"} · {checkin.takenOn}
                  {checkin.weightKg ? ` · ${checkin.weightKg} kg` : ""}
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {shots.map((photo) => (
                    <figure key={photo.id} className="overflow-hidden rounded-lg border bg-muted">
                      {photo.url ? (
                        <img src={photo.url} alt={POSE_LABELS[photo.angle as Pose] ?? photo.angle ?? "Pose"} className="aspect-[3/4] w-full object-cover" />
                      ) : (
                        <div className="grid aspect-[3/4] place-items-center text-xs text-muted-foreground">No preview</div>
                      )}
                      <figcaption className="px-1.5 py-1 text-[10px] font-medium">
                        {POSE_LABELS[photo.angle as Pose] ?? photo.angle}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {archived ? (
          <Button onClick={() => setStarting(true)}>Start a new journey</Button>
        ) : null}
        {journey ? (
        <Button
          disabled={buildingWeek}
          onClick={async () => {
            setBuildingWeek(true);
            try {
              const saved = await journeyService.buildWeek(journey, profile);
              if (saved.alreadySaved) {
                toast({ title: "This week is already saved", description: "Open the dashboard to see today." });
                return;
              }
              toast({
                title: "Week saved",
                description: `${saved.workoutName || "Sessions"} on ${saved.workoutDates.join(", ") || "the open training days"}. Meals at about ${saved.calories} kcal on ${saved.mealDates.length} days.`,
              });
            } catch (err: unknown) {
              toast({
                variant: "destructive",
                title: "Could not build this week",
                description: messageOf(err, "Try again."),
              });
            } finally {
              setBuildingWeek(false);
            }
          }}
        >
          {buildingWeek ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Build this week
        </Button>
        ) : null}
        {journey ? (
        <Button onClick={() => setCheckingIn(true)} disabled={!due && checkins.length > 0}>
          {due ? "Take check-in photos" : `Next photos ${nextDate ?? ""}`}
        </Button>
        ) : null}
        {journey ? (
        <Button
          variant="outline"
          onClick={async () => {
            try {
              if (!window.confirm("End this journey? The baseline, latest check-in, and finished sessions stay on the record.")) return;
              await journeyService.complete(journey.id);
              toast({ title: "Journey completed", description: "The comparison stays on this page." });
              setLoading(true);
              await reload();
            } catch (err: unknown) {
              toast({
                variant: "destructive",
                title: "Could not end the journey",
                description: messageOf(err, "Try again."),
              });
            }
          }}
        >
          End journey
        </Button>
        ) : null}
      </div>
    </div>
  );
}

function JourneyComparison({
  focus,
  checkins,
  photos,
  nextDate,
}: {
  focus: JourneyFocus;
  checkins: JourneyCheckin[];
  photos: ProgressPhoto[];
  nextDate: string | null;
}) {
  const { baseline, latest } = baselineAndLatest(checkins);
  if (!baseline || !latest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparison</CardTitle>
          <CardDescription>
            {nextDate
              ? `The side-by-side poses appear after the photo set on ${nextDate}.`
              : "Take the baseline photos to start the comparison."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const pairs = poseComparisons(focus, baseline.id, latest.id, photos);
  const weight = formatMeasureDelta(measureDelta(baseline.weightKg, latest.weightKg), "kg");
  const waist = formatMeasureDelta(measureDelta(baseline.waistCm, latest.waistCm), "cm");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Since the baseline</CardTitle>
        <CardDescription>{baseline.takenOn} to {latest.takenOn}. Photos show change. They are not a body-fat measurement.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Weight change" value={weight} />
          <Stat label="Waist change" value={waist} />
        </div>
        {pairs.map((pair) => (
          <div key={pair.pose}>
            <p className="text-sm font-semibold">{POSE_LABELS[pair.pose]}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <PoseFigure label={`Baseline · ${baseline.takenOn}`} url={pair.baselineUrl} />
              <PoseFigure label={`Latest · ${latest.takenOn}`} url={pair.latestUrl} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PoseFigure({ label, url }: { label: string; url: string | null }) {
  return (
    <figure className="overflow-hidden rounded-lg border bg-muted">
      {url ? (
        <img src={url} alt={label} className="aspect-[3/4] w-full object-cover" />
      ) : (
        <div className="grid aspect-[3/4] place-items-center px-2 text-center text-xs text-muted-foreground">No photo</div>
      )}
      <figcaption className="px-1.5 py-1 text-[10px] font-medium">{label}</figcaption>
    </figure>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function JourneyWizard({
  defaultWeight,
  defaultHeight,
  defaultLevel,
  onCreated,
  onCancel,
}: {
  defaultWeight: number;
  defaultHeight: number;
  defaultLevel: "beginner" | "intermediate" | "advanced";
  onCreated: () => Promise<void>;
  onCancel?: () => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("focus");
  const [focus, setFocus] = useState<JourneyFocus | null>(null);
  const [equipment, setEquipment] = useState<Equipment>("home");
  const [level, setLevel] = useState(defaultLevel);
  const [weight, setWeight] = useState(String(defaultWeight || ""));
  const [height, setHeight] = useState(String(defaultHeight || ""));
  const [waist, setWaist] = useState("");
  const [targetOn, setTargetOn] = useState(addDays(today(), 56));
  const [files, setFiles] = useState<Partial<Record<Pose, File>>>({});
  const [previews, setPreviews] = useState<Partial<Record<Pose, string>>>({});
  const [saving, setSaving] = useState(false);

  const poses = focus ? posesForFocus(focus) : [];
  const ready = poses.every((pose) => files[pose]);

  const chooseFile = (pose: Pose, file: File | undefined) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Photo is over 5 MB" });
      return;
    }
    setFiles((current) => ({ ...current, [pose]: file }));
    setPreviews((current) => {
      if (current[pose]) URL.revokeObjectURL(current[pose]!);
      return { ...current, [pose]: URL.createObjectURL(file) };
    });
  };

  const save = async () => {
    if (!focus) return;
    const weightKg = Number(weight);
    const heightCm = Number(height);
    const waistCm = waist.trim() ? Number(waist) : null;
    if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 250) {
      toast({ variant: "destructive", title: "Enter a weight between 30 and 250 kg" });
      return;
    }
    if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) {
      toast({ variant: "destructive", title: "Enter a height between 120 and 230 cm" });
      return;
    }
    setSaving(true);
    try {
      const draft: JourneyDraft = {
        focus,
        fitnessLevel: level,
        equipment,
        weightKg,
        heightCm,
        waistCm: waistCm && Number.isFinite(waistCm) ? waistCm : null,
        targetOn,
        photos: files,
      };
      await journeyService.start(draft);
      toast({ title: "Journey started", description: "Your baseline photos are saved." });
      await onCreated();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Could not start the journey",
        description: messageOf(err, "Try again."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="font-display text-3xl font-black text-[#10233f]">Start a journey</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick one focus, confirm your stats, then take the same poses you will repeat later.
        </p>
      </div>

      {step === "focus" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {JOURNEY_FOCUSES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFocus(item.id)}
              className={cn(
                "rounded-2xl border p-4 text-left",
                focus === item.id ? "border-primary bg-primary/5" : "border-border bg-white",
              )}
            >
              <p className="font-semibold">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
            </button>
          ))}
          <div className="sm:col-span-2">
            <Button disabled={!focus} onClick={() => setStep("details")}>Continue</Button>
          </div>
        </div>
      )}

      {step === "details" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your starting point</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Weight (kg)" value={weight} onChange={setWeight} />
            <Field label="Height (cm)" value={height} onChange={setHeight} />
            <Field label="Waist (cm, optional)" value={waist} onChange={setWaist} />
            <div className="space-y-1.5">
              <Label htmlFor="target-on">Target date</Label>
              <Input id="target-on" type="date" value={targetOn} onChange={(event) => setTargetOn(event.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Fitness level</Label>
              <div className="flex flex-wrap gap-2">
                {(["beginner", "intermediate", "advanced"] as const).map((item) => (
                  <Button key={item} type="button" size="sm" variant={level === item ? "default" : "outline"} onClick={() => setLevel(item)}>
                    {item}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Equipment</Label>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT.map((item) => (
                  <Button key={item.id} type="button" size="sm" variant={equipment === item.id ? "default" : "outline"} onClick={() => setEquipment(item.id)}>
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button variant="outline" onClick={() => setStep("focus")}>Back</Button>
              <Button onClick={() => setStep("poses")}>Take baseline photos</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "poses" && focus && (
        <PoseCapture
          poses={poses}
          previews={previews}
          onFile={chooseFile}
          saving={saving}
          ready={ready}
          onBack={() => setStep("details")}
          onSave={() => void save()}
          saveLabel="Save baseline and start"
        />
      )}

      {onCancel && step === "focus" && (
        <Button variant="ghost" onClick={onCancel}>Back to current journey</Button>
      )}
    </div>
  );
}

function CheckinForm({
  journey,
  onCancel,
  onSaved,
}: {
  journey: JourneyRecord;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [weight, setWeight] = useState(String(journey.weightKg ?? ""));
  const [waist, setWaist] = useState(journey.waistCm ? String(journey.waistCm) : "");
  const [files, setFiles] = useState<Partial<Record<Pose, File>>>({});
  const [previews, setPreviews] = useState<Partial<Record<Pose, string>>>({});
  const [saving, setSaving] = useState(false);
  const poses = posesForFocus(journey.focus);
  const ready = poses.every((pose) => files[pose]);

  const chooseFile = (pose: Pose, file: File | undefined) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Photo is over 5 MB" });
      return;
    }
    setFiles((current) => ({ ...current, [pose]: file }));
    setPreviews((current) => {
      if (current[pose]) URL.revokeObjectURL(current[pose]!);
      return { ...current, [pose]: URL.createObjectURL(file) };
    });
  };

  const save = async () => {
    const weightKg = Number(weight);
    if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 250) {
      toast({ variant: "destructive", title: "Enter a weight between 30 and 250 kg" });
      return;
    }
    const waistCm = waist.trim() ? Number(waist) : null;
    setSaving(true);
    try {
      await journeyService.addCheckin(journey, {
        weightKg,
        waistCm: waistCm && Number.isFinite(waistCm) ? waistCm : null,
        photos: files,
      });
      toast({ title: "Check-in saved" });
      await onSaved();
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Could not save the check-in",
        description: messageOf(err, "Try again."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="font-display text-3xl font-black text-[#10233f]">Check-in photos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Use the same poses and the same lighting as the baseline.</p>
      </div>
      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
          <Field label="Weight (kg)" value={weight} onChange={setWeight} />
          <Field label="Waist (cm, optional)" value={waist} onChange={setWaist} />
        </CardContent>
      </Card>
      <PoseCapture
        poses={poses}
        previews={previews}
        onFile={chooseFile}
        saving={saving}
        ready={ready}
        onBack={onCancel}
        onSave={() => void save()}
        saveLabel="Save check-in"
      />
    </div>
  );
}

function PoseCapture({
  poses,
  previews,
  onFile,
  saving,
  ready,
  onBack,
  onSave,
  saveLabel,
}: {
  poses: Pose[];
  previews: Partial<Record<Pose, string>>;
  onFile: (pose: Pose, file: File | undefined) => void;
  saving: boolean;
  ready: boolean;
  onBack: () => void;
  onSave: () => void;
  saveLabel: string;
}) {
  const labels = useMemo(() => poses, [poses]);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {labels.map((pose) => (
          <label key={pose} className="block cursor-pointer overflow-hidden rounded-xl border bg-white">
            {previews[pose] ? (
              <img src={previews[pose]} alt="" className="aspect-[3/4] w-full object-cover" />
            ) : (
              <div className="grid aspect-[3/4] place-items-center text-muted-foreground">
                <Camera className="h-6 w-6" />
              </div>
            )}
            <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
              <span>{POSE_LABELS[pose]}</span>
              {previews[pose] ? <Check className="h-4 w-4 text-primary" /> : <span className="text-xs text-muted-foreground">Add</span>}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="sr-only"
              onChange={(event) => onFile(pose, event.target.files?.[0])}
            />
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} disabled={saving}>Back</Button>
        <Button onClick={onSave} disabled={!ready || saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
