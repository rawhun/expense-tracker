import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ExpenseRow = {
  id: string
  amount: number
  merchant: string
  category: string
  subcategory?: string | null
  payment_method?: string | null
  notes?: string | null
  date: string
  is_impulse?: boolean | null
  is_recurring?: boolean | null
}

function toExpense(row: Record<string, unknown>): ExpenseRow {
  return {
    id: String(row.id),
    amount: Number(row.amount) || 0,
    merchant: String(row.merchant ?? "Unknown"),
    category: String(row.category ?? "General"),
    subcategory: row.subcategory == null ? null : String(row.subcategory),
    payment_method: row.payment_method == null ? null : String(row.payment_method),
    notes: row.notes == null ? null : String(row.notes),
    date: String(row.date ?? new Date().toISOString()),
    is_impulse: Boolean(row.is_impulse),
    is_recurring: Boolean(row.is_recurring),
  }
}

function safeDate(value?: string) {
  if (!value) return new Date().toISOString()
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

async function ensureProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string; email?: string | null }
) {
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (data) return

  await supabase.from("users").insert({
    id: user.id,
    email: user.email,
    name: user.email?.split("@")[0] || "User",
    currency: "INR",
  })
}

export async function getExpenses(): Promise<ExpenseRow[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from("expenses")
      .select("id, amount, merchant, category, subcategory, payment_method, notes, date, is_impulse, is_recurring")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    if (error) {
      console.error("Failed to fetch expenses:", error.message)
      return []
    }

    return (data || []).map((row) => toExpense(row as Record<string, unknown>))
  } catch (error) {
    console.error("getExpenses failed:", error)
    return []
  }
}

export async function saveExpense(expenseData: {
  amount: number
  merchant: string
  category: string
  subcategory?: string
  payment_method?: string
  notes?: string
  date: string
  confidence?: number
  is_recurring?: boolean
  is_impulse?: boolean
}): Promise<ExpenseRow> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await ensureProfile(supabase, user)

  const amount = Number(expenseData.amount)
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Enter a valid amount.")
  }

  const confidenceRaw = expenseData.confidence
  const confidence =
    confidenceRaw == null || Number.isNaN(Number(confidenceRaw))
      ? null
      : Math.min(1, Math.max(0, Number(confidenceRaw)))

  const payload = {
    user_id: user.id,
    amount,
    merchant: (expenseData.merchant || "Unknown").trim() || "Unknown",
    category: (expenseData.category || "General").trim() || "General",
    subcategory: expenseData.subcategory?.trim() || null,
    payment_method: expenseData.payment_method?.trim() || null,
    notes: expenseData.notes?.trim() || null,
    date: safeDate(expenseData.date),
    confidence,
    is_recurring: Boolean(expenseData.is_recurring),
    is_impulse: Boolean(expenseData.is_impulse),
  }

  // Prefer returning the inserted row; fall back if RETURNING is blocked by RLS.
  const { data, error } = await supabase
    .from("expenses")
    .insert([payload])
    .select("id, amount, merchant, category, subcategory, payment_method, notes, date, is_impulse, is_recurring")
    .maybeSingle()

  if (error) {
    // Retry without select in case RETURNING/select policy is the problem
    const { data: inserted, error: insertError } = await supabase
      .from("expenses")
      .insert([payload])
      .select("id")
      .maybeSingle()

    if (insertError || !inserted?.id) {
      throw new Error(error.message || insertError?.message || "Failed to save expense")
    }

    const saved = toExpense({ ...payload, id: inserted.id })
    revalidatePath("/expenses")
    revalidatePath("/dashboard")
    return saved
  }

  if (!data?.id) {
    throw new Error("Expense saved but could not load the new record.")
  }

  const saved = toExpense(data as Record<string, unknown>)
  revalidatePath("/expenses")
  revalidatePath("/dashboard")
  return saved
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/expenses")
  revalidatePath("/dashboard")
}
