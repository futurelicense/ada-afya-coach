import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, User, Utensils, ShoppingBag, Users, Loader2, Sparkles } from "lucide-react";
import { ExploreCard } from "./ExploreCard";
import { ExploreFilters, CategoryType } from "./ExploreFilters";
import { GymPaymentDialog } from "@/components/GymPaymentDialog";
import { TrainerBookingDialog } from "@/components/TrainerBookingDialog";
import {
  Directory,
  ExploreGym,
  ExploreInfluencer,
  ExploreTrainer,
  ExploreVendor,
  bumpInfluencerView,
  fetchDirectory,
  followInfluencer,
} from "@/lib/exploreService";
import { naira, startMarketplaceCheckout } from "@/lib/marketplaceService";
import { useToast } from "@/hooks/use-toast";

export function ExploreDirectory({ searchQuery }: { searchQuery: string }) {
  const { toast } = useToast();
  const [dir, setDir] = useState<Directory | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [gym, setGym] = useState<ExploreGym | null>(null);
  const [trainer, setTrainer] = useState<ExploreTrainer | null>(null);

  useEffect(() => {
    fetchDirectory()
      .then(setDir)
      .catch((err: unknown) => {
        toast({
          variant: "destructive",
          title: "Could not load listings",
          description: err instanceof Error ? err.message : "Check your connection.",
        });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const q = searchQuery.toLowerCase();
  const match = <T extends { name: string; location?: string }>(items: T[]) =>
    items.filter((i) => i.name.toLowerCase().includes(q) || (i.location ?? "").toLowerCase().includes(q));

  const gyms = useMemo(() => match(dir?.gyms ?? []), [dir, q]);
  const trainers = useMemo(() => match(dir?.trainers ?? []), [dir, q]);
  const nutritionists = useMemo(() => match(dir?.nutritionists ?? []), [dir, q]);
  const vendors = useMemo(() => match(dir?.vendors ?? []), [dir, q]);
  const influencers = useMemo(() => match(dir?.influencers ?? []), [dir, q]);

  const show = (cat: CategoryType) => activeCategory === "all" || activeCategory === cat;

  const partner = async (inf: ExploreInfluencer) => {
    try {
      await bumpInfluencerView(inf.id);
      await startMarketplaceCheckout({
        kind: "partnership",
        listingId: inf.id,
        callbackPath: "/explore",
      });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: err instanceof Error ? err.message : "Sign in and try again.",
      });
    }
  };

  const follow = async (inf: ExploreInfluencer) => {
    try {
      await followInfluencer(inf.id);
      toast({ title: `Following ${inf.name}` });
      setDir(await fetchDirectory());
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Could not follow",
        description: err instanceof Error ? err.message : "Sign in first.",
      });
    }
  };

  const orderFromVendor = async (v: ExploreVendor) => {
    const itemName = v.products[0] ?? "Meal";
    try {
      await startMarketplaceCheckout({
        kind: "meal_order",
        listingId: v.id,
        items: [{ name: itemName, price_naira: Math.max(v.minOrder || 2000, 2000) }],
        address: "See order notes after payment",
        callbackPath: "/nutrition",
      });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: err instanceof Error ? err.message : "Sign in and try again.",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const empty = !gyms.length && !trainers.length && !nutritionists.length && !vendors.length && !influencers.length;

  return (
    <div className="space-y-6">
      <ExploreFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} searchQuery={searchQuery} />
      {empty ? (
        <div className="text-center py-16 space-y-2">
          <Sparkles className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">No live listings yet. Vendors, trainers, gyms, and influencers appear here after they publish a listing.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {show("gyms") && gyms.length > 0 && (
            <Section title="Gyms" count={gyms.length}>
              {gyms.map((g) => (
                <ExploreCard
                  key={g.id}
                  title={g.name}
                  subtitle={g.priceRange}
                  rating={g.rating || undefined}
                  location={g.location}
                  phone={g.phone}
                  verified={g.verified}
                  badges={g.amenities.slice(0, 3)}
                  image={g.image}
                  category="Gym"
                  categoryIcon={<Dumbbell className="h-3 w-3" />}
                  onAction={() => setGym(g)}
                  actionLabel="Join & pay"
                />
              ))}
            </Section>
          )}
          {show("trainers") && trainers.length > 0 && (
            <Section title="Trainers" count={trainers.length}>
              {trainers.map((t) => (
                <ExploreCard
                  key={t.id}
                  title={t.name}
                  subtitle={t.specialty}
                  rating={t.rating || undefined}
                  location={t.location}
                  verified={t.certified}
                  badges={[t.experience, naira(t.pricePerSession) + "/session"]}
                  image={t.image}
                  category="Trainer"
                  categoryIcon={<User className="h-3 w-3" />}
                  onAction={() => setTrainer(t)}
                  actionLabel="Book & pay"
                />
              ))}
            </Section>
          )}
          {show("nutritionists") && nutritionists.length > 0 && (
            <Section title="Nutritionists" count={nutritionists.length}>
              {nutritionists.map((t) => (
                <ExploreCard
                  key={t.id}
                  title={t.name}
                  subtitle={t.specialty}
                  rating={t.rating || undefined}
                  location={t.location}
                  verified={t.certified}
                  badges={[naira(t.pricePerSession)]}
                  image={t.image}
                  category="Nutritionist"
                  categoryIcon={<Utensils className="h-3 w-3" />}
                  onAction={() => setTrainer(t)}
                  actionLabel="Book & pay"
                />
              ))}
            </Section>
          )}
          {show("stores") && vendors.length > 0 && (
            <Section title="Meal vendors" count={vendors.length}>
              {vendors.map((v) => (
                <ExploreCard
                  key={v.id}
                  title={v.name}
                  subtitle={v.type}
                  rating={v.rating || undefined}
                  location={v.location}
                  phone={v.phone}
                  badges={(v.products.slice(0, 3)).concat(v.delivery ? ["Delivery"] : [])}
                  image={v.image}
                  category="Vendor"
                  categoryIcon={<ShoppingBag className="h-3 w-3" />}
                  onAction={() => void orderFromVendor(v)}
                  actionLabel="Order & pay"
                />
              ))}
            </Section>
          )}
          {show("influencers") && influencers.length > 0 && (
            <Section title="Influencers" count={influencers.length}>
              {influencers.map((i) => (
                <ExploreCard
                  key={i.id}
                  title={i.name}
                  subtitle={i.niche}
                  badges={[i.platform, `${i.followers} followers`, naira(i.rate)]}
                  image={i.image}
                  category="Influencer"
                  categoryIcon={<Users className="h-3 w-3" />}
                  onAction={() => void partner(i)}
                  actionLabel="Partner & pay"
                >
                  <Button size="sm" variant="ghost" className="mt-2" onClick={() => void follow(i)}>Follow on WeFit</Button>
                </ExploreCard>
              ))}
            </Section>
          )}
        </div>
      )}

      <GymPaymentDialog gym={gym} open={!!gym} onClose={() => setGym(null)} />
      <TrainerBookingDialog trainer={trainer} open={!!trainer} onClose={() => setTrainer(null)} gyms={gyms} />
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Badge variant="outline">{count}</Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">{children}</div>
    </div>
  );
}
