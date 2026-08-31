import { supabase } from "./supabase";

export interface ExploreGym {
  id: string;
  name: string;
  location: string;
  rating: number;
  priceRange: string;
  amenities: string[];
  verified: boolean;
  phone: string;
  image?: string;
  membershipPlans: Array<{ id: string; name: string; amount_naira: number; months: number }>;
  capacity: number;
}

export interface ExploreTrainer {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  pricePerSession: number;
  location: string;
  phone: string;
  certified: boolean;
  image?: string;
  kind: "trainer" | "nutritionist";
}

export interface ExploreVendor {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
  products: string[];
  delivery: boolean;
  phone: string;
  image?: string;
  deliveryFee: number;
  minOrder: number;
}

export interface ExploreInfluencer {
  id: string;
  name: string;
  followers: string;
  niche: string;
  verified: boolean;
  platform: string;
  image?: string;
  rate: number;
}

export interface Directory {
  gyms: ExploreGym[];
  trainers: ExploreTrainer[];
  nutritionists: ExploreTrainer[];
  vendors: ExploreVendor[];
  influencers: ExploreInfluencer[];
}

function loc(city?: string | null, address?: string | null): string {
  return [address, city].filter(Boolean).join(", ") || "Nigeria";
}

export async function fetchDirectory(): Promise<Directory> {
  const [gymsRes, trainersRes, vendorsRes, infRes, menuRes] = await Promise.all([
    supabase.from("gyms").select("*").eq("published", true).order("created_at", { ascending: false }),
    supabase.from("public_trainers").select("*").eq("published", true).order("created_at", { ascending: false }),
    supabase.from("vendors").select("*").eq("published", true).order("created_at", { ascending: false }),
    supabase.from("influencers").select("*").eq("published", true).order("created_at", { ascending: false }),
    supabase.from("vendor_menu_items").select("vendor_id, name").eq("available", true),
  ]);

  const menuByVendor = new Map<string, string[]>();
  for (const row of menuRes.data ?? []) {
    const list = menuByVendor.get(row.vendor_id) ?? [];
    list.push(row.name);
    menuByVendor.set(row.vendor_id, list);
  }

  const gyms: ExploreGym[] = (gymsRes.data ?? []).map((g) => {
    const plans = Array.isArray(g.membership_plans) ? g.membership_plans : [];
    const monthly = plans.find((p: { id: string }) => p.id === "monthly") ?? plans[0];
    const amount = monthly?.amount_naira ?? 25000;
    return {
      id: g.id,
      name: g.name,
      location: loc(g.city, g.address),
      rating: Number(g.rating) || 0,
      priceRange: `₦${Number(amount).toLocaleString()}/month`,
      amenities: g.facilities ?? [],
      verified: !!g.is_verified,
      phone: g.phone ?? "",
      image: g.image_url ?? undefined,
      membershipPlans: plans,
      capacity: g.capacity ?? 80,
    };
  });

  const allTrainers: ExploreTrainer[] = (trainersRes.data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    specialty: (t.specializations ?? []).join(", ") || t.bio || "Training",
    experience: t.years_experience ? `${t.years_experience} years` : "—",
    rating: Number(t.rating) || 0,
    pricePerSession: t.price_per_session_naira ?? 5000,
    location: loc(t.city, t.state),
    phone: "",
    certified: (t.certifications ?? []).length > 0,
    image: t.image_url ?? undefined,
    kind: t.kind === "nutritionist" ? "nutritionist" : "trainer",
  }));

  const vendors: ExploreVendor[] = (vendorsRes.data ?? []).map((v) => ({
    id: v.id,
    name: v.name,
    type: (v.cuisine_types ?? []).join(", ") || "Meals",
    location: loc(v.city, v.address),
    rating: Number(v.rating) || 0,
    products: menuByVendor.get(v.id) ?? v.cuisine_types ?? [],
    delivery: true,
    phone: v.phone ?? "",
    image: v.image_url ?? undefined,
    deliveryFee: v.delivery_fee_naira ?? 0,
    minOrder: v.min_order_naira ?? 0,
  }));

  const influencers: ExploreInfluencer[] = (infRes.data ?? []).map((i) => ({
    id: i.id,
    name: i.name,
    followers: String(i.follower_count ?? 0),
    niche: i.niche ?? "Fitness",
    verified: true,
    platform: i.platform ?? "WeFit",
    image: i.image_url ?? undefined,
    rate: i.partnership_rate_naira ?? 50000,
  }));

  return {
    gyms,
    trainers: allTrainers.filter((t) => t.kind === "trainer"),
    nutritionists: allTrainers.filter((t) => t.kind === "nutritionist"),
    vendors,
    influencers,
  };
}

export async function followInfluencer(influencerId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to follow.");
  const { error } = await supabase.from("influencer_follows").insert({
    influencer_id: influencerId,
    follower_id: user.id,
  });
  if (error && !error.message.includes("duplicate")) throw error;
}

export async function bumpInfluencerView(influencerId: string): Promise<void> {
  await supabase.rpc("increment_influencer_views", { p_id: influencerId });
}
