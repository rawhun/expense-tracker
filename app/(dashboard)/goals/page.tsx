import { getGoals } from "./actions"
import GoalsClient from "./GoalsClient"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_CURRENCY } from "@/lib/utils"

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('users')
    .select('currency')
    .eq('id', user?.id ?? '')
    .maybeSingle()

  const goals = await getGoals()
  return (
    <GoalsClient
      initialGoals={goals}
      currency={profile?.currency || DEFAULT_CURRENCY}
    />
  )
}
