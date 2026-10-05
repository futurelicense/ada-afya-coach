import { supabase } from "@/lib/supabase";
import { groupDecisionLocked } from "@/lib/groupRules";

export interface WorkoutGroup {
  id: string;
  name: string;
  ownerId: string;
  status: "invited" | "joined";
}

export interface GroupMember {
  id: string;
  userId: string | null;
  email: string | null;
  status: "invited" | "joined";
  name: string;
}

export interface ScheduleSlot {
  id: string;
  weekday: number;
  startTime: string;
  label: string;
  agreements: number;
  locked: boolean;
  agreed: boolean;
}

export interface MealLock {
  id: string;
  mealPlanId: string;
  title: string;
  vendorName: string;
  status: "proposed" | "locked";
  agreements: number;
  agreed: boolean;
}

export interface GroupMessage {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
}

export interface TrainerPackageOffer {
  id: string;
  trainerName: string;
  title: string;
  months: number;
  sessionsPerMonth: number;
  priceNaira: number;
  summary: string;
}

async function userId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("Sign in to use groups.");
  return id;
}

export const groupService = {
  async listMine(): Promise<WorkoutGroup[]> {
    const id = await userId();
    const { data: profile } = await supabase.from("profiles").select("email").eq("id", id).maybeSingle();
    const email = (profile?.email as string | undefined)?.toLowerCase();
    const { data, error } = await supabase
      .from("workout_group_members")
      .select("status, workout_groups(id, name, owner_id)")
      .or(email ? `user_id.eq.${id},email.eq.${email}` : `user_id.eq.${id}`);
    if (error) throw error;
    return (data ?? []).flatMap((row) => {
      const group = row.workout_groups as { id: string; name: string; owner_id: string } | { id: string; name: string; owner_id: string }[] | null;
      const item = Array.isArray(group) ? group[0] : group;
      if (!item) return [];
      return [{ id: item.id, name: item.name, ownerId: item.owner_id, status: row.status as WorkoutGroup["status"] }];
    });
  },

  async create(name: string): Promise<string> {
    const id = await userId();
    const { data: profile } = await supabase.from("profiles").select("email").eq("id", id).maybeSingle();
    const { data, error } = await supabase.from("workout_groups").insert({ name: name.trim(), owner_id: id }).select("id").single();
    if (error || !data) throw error ?? new Error("Could not create the group.");
    const { error: memberError } = await supabase.from("workout_group_members").insert({
      group_id: data.id,
      user_id: id,
      email: (profile?.email as string | undefined)?.toLowerCase() ?? null,
      status: "joined",
    });
    if (memberError) throw memberError;
    return data.id as string;
  },

  async invite(groupId: string, email: string): Promise<void> {
    const { error } = await supabase.from("workout_group_members").insert({
      group_id: groupId,
      email: email.trim().toLowerCase(),
      status: "invited",
    });
    if (error) throw error;
  },

  async accept(memberId: string): Promise<void> {
    const id = await userId();
    const { error } = await supabase.from("workout_group_members").update({ user_id: id, status: "joined" }).eq("id", memberId);
    if (error) throw error;
  },

  async members(groupId: string): Promise<GroupMember[]> {
    const { data, error } = await supabase
      .from("workout_group_members")
      .select("id, user_id, email, status")
      .eq("group_id", groupId);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      userId: (row.user_id as string) ?? null,
      email: (row.email as string) ?? null,
      status: row.status as GroupMember["status"],
      name: (row.email as string) || "Member",
    }));
  },

  async schedule(groupId: string): Promise<ScheduleSlot[]> {
    const id = await userId();
    const members = await this.members(groupId);
    const joined = members.filter((member) => member.status === "joined").length;
    const { data, error } = await supabase
      .from("group_schedule_slots")
      .select("id, weekday, start_time, label, group_schedule_agreements(user_id)")
      .eq("group_id", groupId);
    if (error) throw error;
    return (data ?? []).map((row) => {
      const agreements = (row.group_schedule_agreements as Array<{ user_id: string }> | null) ?? [];
      return {
        id: row.id as string,
        weekday: Number(row.weekday),
        startTime: row.start_time as string,
        label: row.label as string,
        agreements: agreements.length,
        locked: groupDecisionLocked(joined, agreements.length),
        agreed: agreements.some((item) => item.user_id === id),
      };
    });
  },

  async proposeSlot(groupId: string, weekday: number, startTime: string, label: string): Promise<void> {
    const id = await userId();
    const { data, error } = await supabase.from("group_schedule_slots").insert({
      group_id: groupId,
      weekday,
      start_time: startTime,
      label,
      created_by: id,
    }).select("id").single();
    if (error || !data) throw error ?? new Error("Could not add the time.");
    const { error: agreeError } = await supabase.from("group_schedule_agreements").insert({ slot_id: data.id, user_id: id });
    if (agreeError) throw agreeError;
  },

  async agreeSlot(slotId: string): Promise<void> {
    const id = await userId();
    const { error } = await supabase.from("group_schedule_agreements").insert({ slot_id: slotId, user_id: id });
    if (error) throw error;
  },

  async mealLocks(groupId: string): Promise<MealLock[]> {
    const id = await userId();
    const members = await this.members(groupId);
    const joined = members.filter((member) => member.status === "joined").length;
    const { data, error } = await supabase
      .from("group_meal_locks")
      .select("id, meal_plan_id, status, vendor_meal_plans(title, vendors(name)), group_meal_agreements(user_id)")
      .eq("group_id", groupId);
    if (error) throw error;
    return (data ?? []).map((row) => {
      const plan = row.vendor_meal_plans as { title?: string; vendors?: { name?: string } | { name?: string }[] } | null;
      const vendor = plan?.vendors;
      const vendorName = Array.isArray(vendor) ? vendor[0]?.name : vendor?.name;
      const agreements = (row.group_meal_agreements as Array<{ user_id: string }> | null) ?? [];
      return {
        id: row.id as string,
        mealPlanId: row.meal_plan_id as string,
        title: plan?.title || "Meal plan",
        vendorName: vendorName || "Vendor",
        status: row.status as MealLock["status"],
        agreements: agreements.length,
        agreed: agreements.some((item) => item.user_id === id),
      };
    });
  },

  async publishedMealPlans(): Promise<Array<{ id: string; title: string; vendorName: string; priceNaira: number }>> {
    const { data, error } = await supabase
      .from("vendor_meal_plans")
      .select("id, title, price_naira, vendors(name)")
      .eq("published", true);
    if (error) throw error;
    return (data ?? []).map((row) => {
      const vendor = row.vendors as { name?: string } | { name?: string }[] | null;
      return {
        id: row.id as string,
        title: row.title as string,
        vendorName: (Array.isArray(vendor) ? vendor[0]?.name : vendor?.name) || "Vendor",
        priceNaira: Number(row.price_naira),
      };
    });
  },

  async proposeMeal(groupId: string, mealPlanId: string): Promise<void> {
    const id = await userId();
    const { data, error } = await supabase.from("group_meal_locks").insert({
      group_id: groupId,
      meal_plan_id: mealPlanId,
      proposed_by: id,
      status: "proposed",
    }).select("id").single();
    if (error || !data) throw error ?? new Error("Could not propose the meal plan.");
    await supabase.rpc("agree_group_meal", { p_lock: data.id });
  },

  async agreeMeal(lockId: string): Promise<void> {
    const { error } = await supabase.rpc("agree_group_meal", { p_lock: lockId });
    if (error) throw error;
  },

  async messages(groupId: string): Promise<GroupMessage[]> {
    const { data, error } = await supabase
      .from("group_messages")
      .select("id, user_id, body, created_at")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      userId: row.user_id as string,
      body: row.body as string,
      createdAt: row.created_at as string,
    }));
  },

  async send(groupId: string, body: string): Promise<void> {
    const id = await userId();
    const { error } = await supabase.from("group_messages").insert({ group_id: groupId, user_id: id, body: body.trim() });
    if (error) throw error;
  },

  async progress(groupId: string): Promise<Array<{ userId: string; name: string; sessions: number }>> {
    const { data, error } = await supabase.rpc("group_progress", { p_group: groupId });
    if (error) throw error;
    return (data ?? []).map((row: { user_id: string; name: string; sessions: number }) => ({
      userId: row.user_id,
      name: row.name,
      sessions: Number(row.sessions),
    }));
  },

  async packages(): Promise<TrainerPackageOffer[]> {
    const { data, error } = await supabase
      .from("trainer_packages")
      .select("id, title, months, sessions_per_month, price_naira, summary, public_trainers(name)")
      .eq("published", true);
    if (error) throw error;
    return (data ?? []).map((row) => {
      const trainer = row.public_trainers as { name?: string } | { name?: string }[] | null;
      return {
        id: row.id as string,
        trainerName: (Array.isArray(trainer) ? trainer[0]?.name : trainer?.name) || "Trainer",
        title: row.title as string,
        months: Number(row.months),
        sessionsPerMonth: Number(row.sessions_per_month),
        priceNaira: Number(row.price_naira),
        summary: (row.summary as string) ?? "",
      };
    });
  },

  async pitch(groupId: string, packageId: string): Promise<void> {
    const id = await userId();
    const { error } = await supabase.from("group_trainer_pitches").insert({
      group_id: groupId,
      package_id: packageId,
      pitched_by: id,
      status: "pitched",
    });
    if (error) throw error;
  },
};
