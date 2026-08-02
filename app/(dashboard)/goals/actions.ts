"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type GoalRow = {
  id: string
  title: string
  target_amount: number
  current_amount: number
  status: string
  deadline?: string | null
}

function toGoal(row: Record<string, unknown>): GoalRow {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    target_amount: Number(row.target_amount) || 0,
    current_amount: Number(row.current_amount) || 0,
    status: String(row.status ?? "active"),
    deadline: row.deadline == null ? null : String(row.deadline),
  }
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

export async function getGoals(): Promise<GoalRow[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from("goals")
      .select("id, title, target_amount, current_amount, status, deadline")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch goals:", error.message)
      return []
    }

    return (data || []).map((row) => toGoal(row as Record<string, unknown>))
  } catch (error) {
    console.error("getGoals failed:", error)
    return []
  }
}

export async function createGoal(goalData: {
  title: string
  target: number
  deadline?: string
}): Promise<GoalRow> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await ensureProfile(supabase, user)

  const target = Number(goalData.target)
  if (!goalData.title?.trim() || !Number.isFinite(target) || target <= 0) {
    throw new Error("Enter a valid goal title and target amount.")
  }

  const payload = {
    user_id: user.id,
    title: goalData.title.trim(),
    target_amount: target,
    current_amount: 0,
    deadline: goalData.deadline || null,
    status: "active",
  }

  const { data, error } = await supabase
    .from("goals")
    .insert([payload])
    .select("id, title, target_amount, current_amount, status, deadline")
    .maybeSingle()

  if (error || !data?.id) {
    throw new Error(error?.message || "Failed to create goal")
  }

  revalidatePath("/goals")
  revalidatePath("/dashboard")
  return toGoal(data as Record<string, unknown>)
}

export async function deleteGoal(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/goals")
  revalidatePath("/dashboard")
}

export async function addFundsToGoal(id: string, amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const addAmount = Number(amount)
  if (!Number.isFinite(addAmount) || addAmount <= 0) {
    throw new Error("Enter a valid amount.")
  }

  const { data: goal } = await supabase
    .from("goals")
    .select("current_amount, target_amount")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!goal) throw new Error("Goal not found")

  const newAmount = Number(goal.current_amount) + addAmount
  const newStatus = newAmount >= Number(goal.target_amount) ? "completed" : "active"

  const { error } = await supabase
    .from("goals")
    .update({ current_amount: newAmount, status: newStatus })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/goals")
  revalidatePath("/dashboard")
}
