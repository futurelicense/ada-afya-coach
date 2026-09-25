import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, User, Utensils, ShoppingBag, Users, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { ExploreCard } from "./ExploreCard";
import { ExploreFilters, CategoryType } from "./ExploreFilters";
import { GymPaymentDialog } from "@/components/GymPaymentDialog";
import { TrainerBookingDialog } from "@/components/TrainerBookingDialog";
import { EmptyState } from "@/components/EmptyState";
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
  const navigate = useNavigate();
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

  // Ordering happens on the Nutrition page where the full menu + cart lives.
  const orderFromVendor = (v: ExploreVendor) => navigate(`/nutrition?vendor=${v.id}`);

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const empty = !gyms.length && !trainers.length && !nutritionists.length && !vendors.length && !influencers.length;

  return (
    <div className="space-y-6">
      <ExploreFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} searchQuery={searchQuery} />
      {empty ? (
        <EmptyState
          icon={Sparkles}
          title="No live listings yet"
          description="Vendors, trainers, gyms, and influencers appear here after they publish a listing."
        />
      ) : (
        <div className="space-y-7">
          {show("gyms") && gyms.length > 0 && (
            <Section title="Popular Gyms" count={gyms.length} icon={<Dumbbell className="h-5 w-5" />}>
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
            <Section title="Trainers" count={trainers.length} icon={<User className="h-5 w-5" />}>
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
            <Section title="Nutritionists" count={nutritionists.length} icon={<Utensils className="h-5 w-5" />}>
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
            <Section title="Healthy Kitchens & Meal Vendors" count={vendors.length} icon={<Utensils className="h-5 w-5" />}>
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
                  onAction={() => orderFromVendor(v)}
                  actionLabel="View menu & order"
                >
                  {v.menu.length > 0 && (
                    <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                      {v.menu.slice(0, 3).map((m, idx) => (
                        <li key={idx} className="flex justify-between gap-2">
                          <span className={m.in_stock ? "" : "line-through"}>{m.name}</span>
                          <span>{naira(m.price_naira)}</span>
                        </li>
                      ))}
                      {v.menu.length > 3 && <li>+{v.menu.length - 3} more…</li>}
                    </ul>
                  )}
                </ExploreCard>
              ))}
            </Section>
          )}
          {show("influencers") && influencers.length > 0 && (
            <Section title="Fitness Creators & Influencers" count={influencers.length} icon={<Users className="h-5 w-5" />}>
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
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => void follow(i)}>Follow</Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/creator/${i.id}`}>View profile</Link>
                    </Button>
                  </div>
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

function Section({ title, count, icon, children }: { title: string; count: number; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-black text-[#10233f]">
          <span className="text-primary">{icon}</span>{title}
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{count}</Badge>
        </h2>
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-primary">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}
