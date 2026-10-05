import { supabase } from "./supabase";

export interface ProgressPhoto {
  id: string;
  url: string;
  storagePath: string;
  date: string;
  note: string;
  angle: string | null;
  checkinId?: string | null;
}

interface UploadOptions {
  note?: string;
  angle?: string;
  journeyId?: string;
  checkinId?: string;
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("Sign in to manage progress photos.");
  return id;
}

async function signedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("progress-photos")
    .createSignedUrl(path, 60 * 60);
  if (error || !data?.signedUrl) throw error ?? new Error("Could not load photo");
  return data.signedUrl;
}

export const progressPhotoService = {
  async list(): Promise<ProgressPhoto[]> {
    const userId = await currentUserId();
    const { data, error } = await supabase
      .from("progress_photos")
      .select("id, storage_path, angle, notes, taken_at")
      .eq("user_id", userId)
      .order("taken_at", { ascending: true });
    if (error) throw error;

    const rows = data ?? [];
    return Promise.all(
      rows.map(async (row) => ({
        id: row.id as string,
        storagePath: row.storage_path as string,
        date: row.taken_at as string,
        note: (row.notes as string) || "Progress photo",
        angle: (row.angle as string) ?? null,
        url: await signedUrl(row.storage_path as string),
      })),
    );
  },

  async upload(file: File, noteOrOptions: string | UploadOptions = "Progress photo"): Promise<void> {
    const options: UploadOptions = typeof noteOrOptions === "string" ? { note: noteOrOptions } : noteOrOptions;
    const userId = await currentUserId();
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
    const storagePath = `${userId}/${Date.now()}-${options.angle ?? "photo"}.${safeExt}`;

    const { error: uploadError } = await supabase.storage
      .from("progress-photos")
      .upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;

    const row: Record<string, unknown> = {
      user_id: userId,
      storage_path: storagePath,
      notes: options.note ?? "Progress photo",
      taken_at: new Date().toISOString().split("T")[0],
    };
    if (options.angle) row.angle = options.angle;
    if (options.journeyId) row.journey_id = options.journeyId;
    if (options.checkinId) row.checkin_id = options.checkinId;

    const { error: insertError } = await supabase.from("progress_photos").insert(row);
    if (insertError) {
      await supabase.storage.from("progress-photos").remove([storagePath]);
      throw insertError;
    }
  },

  async remove(photo: ProgressPhoto): Promise<void> {
    const userId = await currentUserId();
    await supabase.storage.from("progress-photos").remove([photo.storagePath]);
    const { error } = await supabase
      .from("progress_photos")
      .delete()
      .eq("id", photo.id)
      .eq("user_id", userId);
    if (error) throw error;
  },
};
