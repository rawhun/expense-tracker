import { createClient } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('users')
    .select('name, email, timezone, currency')
    .eq('id', user?.id)
    .single();

  return (
    <SettingsClient
      name={profile?.name || user?.user_metadata?.name || ""}
      email={profile?.email || user?.email || ""}
      currency={profile?.currency || "INR"}
    />
  );
}
