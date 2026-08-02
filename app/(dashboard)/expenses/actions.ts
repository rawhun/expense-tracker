"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getExpenses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (error) {
    console.error('Failed to fetch expenses:', error)
    return []
  }
  return data || []
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
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase.from('expenses').insert([{
    user_id: user.id,
    amount: expenseData.amount,
    merchant: expenseData.merchant,
    category: expenseData.category,
    subcategory: expenseData.subcategory || null,
    payment_method: expenseData.payment_method || null,
    notes: expenseData.notes || null,
    date: expenseData.date,
    confidence: expenseData.confidence ?? null,
    is_recurring: expenseData.is_recurring ?? false,
    is_impulse: expenseData.is_impulse ?? false,
  }]).select('*').maybeSingle()

  if (error) throw new Error(error.message)
  revalidatePath('/expenses')
  revalidatePath('/dashboard')
  return data
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // security: only delete own expenses

  if (error) throw new Error(error.message)
  revalidatePath('/expenses')
  revalidatePath('/dashboard')
}
