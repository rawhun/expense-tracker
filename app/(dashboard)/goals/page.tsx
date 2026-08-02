import GoalsClient from "./GoalsClient"
import { getGoals } from "./actions"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_CURRENCY } from "@/lib/utils"

export default async function GoalsPage() {
  let currency = DEFAULT_CURRENCY
  let goals: Awaited<ReturnType<typeof getGoals>> = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("currency")
        .eq("id", user.id)
        .maybeSingle()
      currency = profile?.currency || DEFAULT_CURRENCY
    }

    goals = await getGoals()
  } catch (error) {
    console.error("Goals page load failed:", error)
  }

  return <GoalsClient initialGoals={goals} currency={currency} />
}
