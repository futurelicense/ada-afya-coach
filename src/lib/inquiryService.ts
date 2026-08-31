import { supabase } from "./supabase";

export type InquiryType =
  | "gym_membership"
  | "trainer_booking"
  | "meal_order"
  | "nutritionist_booking"
  | "event_interest";

export async function createInquiry(params: {
  type: InquiryType;
  listingId: string;
  listingName: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to send a request.");

  const { error } = await supabase.from("inquiries").insert({
    user_id: user.id,
    type: params.type,
    listing_id: params.listingId,
    listing_name: params.listingName,
    payload: params.payload ?? {},
    status: "pending",
  });

  if (error) throw error;
}
