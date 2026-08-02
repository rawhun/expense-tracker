import { DEFAULT_CURRENCY } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;

  const { data: profile } = await supabase
    .from('users')
    .select('name, email, timezone, currency')
    .eq('id', user?.id ?? '')
    .maybeSingle();

  return (
    <SettingsClient
      name={profile?.name || user?.user_metadata?.name || ""}
      email={profile?.email || user?.email || ""}
      currency={profile?.currency || DEFAULT_CURRENCY}
    />
  );
}
