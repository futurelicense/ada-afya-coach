import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { JourneyFocus } from "@/lib/journey";
import { JourneyRequestRow, MealPlanOffer, RoutineOffer, journeyOffers, publicMediaUrl } from "@/lib/journeyOffers";
import { createInquiry } from "@/lib/inquiryService";
import { naira } from "@/lib/marketplaceService";
import { supabase } from "@/lib/supabase";

export function JourneyMarketplace({ journeyId, focus }: { journeyId: string; focus: JourneyFocus }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [routines, setRoutines] = useState<RoutineOffer[]>([]);
  const [plans, setPlans] = useState<MealPlanOffer[]>([]);
  const [requests, setRequests] = useState<JourneyRequestRow[]>([]);
  const [nutritionists, setNutritionists] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setSchemaMissing(false);
    try {
      const [routineRows, planRows, requestRows, nutrition] = await Promise.all([
        journeyOffers.listRoutines(focus),
        journeyOffers.listMealPlans(focus),
        journeyOffers.listRequests(journeyId),
        supabase.from("public_trainers").select("id, name, price_per_session_naira").eq("kind", "nutritionist").eq("published", true),
      ]);
      setRoutines(routineRows);
      setPlans(planRows);
      setRequests(requestRows);
      setNutritionists((nutrition.data ?? []).map((row) => ({
        id: row.id as string,
        name: (row.name as string) || "Nutritionist",
        price: Number(row.price_per_session_naira ?? 0),
      })));
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "";
      if (/trainer_routines|vendor_meal_plans|journey_requests|schema cache|does not exist/i.test(message)) setSchemaMissing(true);
      else toast({ variant: "destructive", title: "Could not load journey offers", description: message || "Try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [journeyId, focus]);

  const requested = (id: string, kind: "routine" | "meal_plan") =>
    requests.some((row) => (kind === "routine" ? row.routineId === id : row.mealPlanId === id));

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  if (schemaMissing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trainer and vendor offers</CardTitle>
          <CardDescription>Apply supabase/migrations/023_journey_offers.sql to request a routine or a meal plan.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trainer routines</CardTitle>
          <CardDescription>A request goes to the trainer who wrote it. Audio and the demo clip stay with each move.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {routines.length === 0 ? <p className="text-sm text-muted-foreground">No routine is published for this focus yet.</p> : routines.map((routine) => (
            <div key={routine.id} className="rounded-xl border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{routine.title}</p>
                  <p className="text-sm text-muted-foreground">{routine.trainerName} · {naira(routine.priceNaira)}</p>
                </div>
                <Button size="sm" disabled={requested(routine.id, "routine") || busy === routine.id} onClick={async () => {
                  setBusy(routine.id);
                  try {
                    await journeyOffers.requestRoutine(journeyId, routine.id);
                    toast({ title: "Routine requested", description: `${routine.trainerName} can see this on their routine page.` });
                    await load();
                  } catch (err: unknown) {
                    const message = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "Try again.";
                    toast({ variant: "destructive", title: "Could not request the routine", description: message });
                  } finally {
                    setBusy(null);
                  }
                }}>{requested(routine.id, "routine") ? "Requested" : "Request routine"}</Button>
              </div>
              <ul className="mt-3 space-y-2">
                {routine.moves.map((move) => (
                  <li key={move.id ?? move.name} className="text-sm">
                    <p className="font-medium">{move.name} · {move.sets}×{move.reps}</p>
                    {move.cue ? <p className="text-muted-foreground">{move.cue}</p> : null}
                    {publicMediaUrl(move.audioPath) ? <audio controls src={publicMediaUrl(move.audioPath)!} className="mt-1 w-full" /> : null}
                    {publicMediaUrl(move.clipPath) ? <video controls src={publicMediaUrl(move.clipPath)!} className="mt-1 max-h-48 rounded-lg" /> : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vendor meal plans</CardTitle>
          <CardDescription>A request goes to the kitchen that published the plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {plans.length === 0 ? <p className="text-sm text-muted-foreground">No meal plan is published for this focus yet.</p> : plans.map((plan) => (
            <div key={plan.id} className="flex items-start justify-between gap-2 rounded-xl border p-3">
              <div>
                <p className="font-semibold">{plan.title}</p>
                <p className="text-sm text-muted-foreground">{plan.vendorName} · {naira(plan.priceNaira)}</p>
                <ul className="mt-1 text-sm text-muted-foreground">
                  {plan.meals.map((meal) => <li key={meal.name}>{meal.mealType}: {meal.name} · {meal.calories} kcal</li>)}
                </ul>
              </div>
              <Button size="sm" disabled={requested(plan.id, "meal_plan") || busy === plan.id} onClick={async () => {
                setBusy(plan.id);
                try {
                  await journeyOffers.requestMealPlan(journeyId, plan.id);
                  toast({ title: "Meal plan requested", description: `${plan.vendorName} can see this on their meal plan page.` });
                  await load();
                } catch (err: unknown) {
                  const message = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "Try again.";
                  toast({ variant: "destructive", title: "Could not request the plan", description: message });
                } finally {
                  setBusy(null);
                }
              }}>{requested(plan.id, "meal_plan") ? "Requested" : "Request plan"}</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nutritionists</CardTitle>
          <CardDescription>A nutritionist is a trainer listing. The request lands in their inbox with this journey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {nutritionists.length === 0 ? <p className="text-sm text-muted-foreground">No nutritionist listing is published yet.</p> : nutritionists.map((person) => (
            <div key={person.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
              <div>
                <p className="font-medium">{person.name}</p>
                <p className="text-sm text-muted-foreground">{naira(person.price)} / session</p>
              </div>
              <Button size="sm" variant="outline" disabled={busy === person.id} onClick={async () => {
                setBusy(person.id);
                try {
                  await createInquiry({
                    type: "nutritionist_booking",
                    listingId: person.id,
                    listingName: person.name,
                    payload: { journeyId, focus },
                  });
                  toast({ title: "Request sent", description: `${person.name} can see it under Requests.` });
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : "Try again.";
                  toast({ variant: "destructive", title: "Could not send the request", description: message });
                } finally {
                  setBusy(null);
                }
              }}>Request a match</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
