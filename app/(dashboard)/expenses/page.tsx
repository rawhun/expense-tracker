import ExpensesClient from "./ExpensesClient"
import { getExpenses } from "./actions"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_CURRENCY } from "@/lib/utils"

export default async function ExpensesPage() {
  let currency = DEFAULT_CURRENCY
  let expenses: Awaited<ReturnType<typeof getExpenses>> = []

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

    expenses = await getExpenses()
  } catch (error) {
    console.error("Expenses page load failed:", error)
  }

  return (
    <ExpensesClient
      initialExpenses={expenses}
      currency={currency}
    />
  )
}
