"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getGoals() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch goals:', error)
    return []
  }
  return data || []
}

export async function createGoal(goalData: {
  title: string
  target: number
  deadline?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase.from('goals').insert([{
    user_id: user.id,
    title: goalData.title,
    target_amount: goalData.target,
    current_amount: 0,
    deadline: goalData.deadline || null,
    status: 'active',
  }]).select('*').maybeSingle()

  if (error) throw new Error(error.message)
  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return data
}

export async function deleteGoal(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/goals')
  revalidatePath('/dashboard')
}

export async function addFundsToGoal(id: string, amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: goal } = await supabase
    .from('goals')
    .select('current_amount, target_amount')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!goal) throw new Error('Goal not found')

  const newAmount = Number(goal.current_amount) + amount
  const newStatus = newAmount >= Number(goal.target_amount) ? 'completed' : 'active'

  const { error } = await supabase
    .from('goals')
    .update({ current_amount: newAmount, status: newStatus })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/goals')
  revalidatePath('/dashboard')
}
