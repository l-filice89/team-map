import { supabase } from "@/integrations/supabase/client";

/**
 * Permanently delete the current user's account and all associated data
 * (profile, location, avatar). GDPR-aligned; cannot be undone.
 * Call signOut() and redirect after success.
 */
export async function deleteAccount(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Failed to delete account" }));
    throw new Error(body.error || "Failed to delete account");
  }
}
