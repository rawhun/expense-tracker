import { getExpenses } from "./actions"
import ExpensesClient from "./ExpensesClient"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_CURRENCY } from "@/lib/utils"

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('users')
    .select('currency')
    .eq('id', user?.id ?? '')
    .maybeSingle()

  const expenses = await getExpenses()
  return (
    <ExpensesClient
      initialExpenses={expenses}
      currency={profile?.currency || DEFAULT_CURRENCY}
    />
  )
}
