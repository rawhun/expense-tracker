import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Target, MessageSquare, CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SpendingChart } from "@/components/SpendingChart";
import { DEFAULT_CURRENCY, formatMoney } from "@/lib/utils";

export default async function Dashboard() {
  let user = null as { id: string; email?: string; user_metadata?: { name?: string } } | null
  let profile: { name?: string | null; currency?: string | null } | null = null
  let expenses: Array<{
    id: string
    merchant?: string | null
    category?: string | null
    amount?: number | string | null
  }> = []
  let topGoal: {
    title?: string | null
    current_amount?: number | string | null
    target_amount?: number | string | null
  } | null = null
  let todayTotal = 0
  let chartData: Array<{ label: string; amount: number }> = []

  try {
    const supabase = await createClient()
    const { data: authData } = await supabase.auth.getUser()
    user = authData?.user ?? null

    const { data: profileRow } = await supabase
      .from('users')
      .select('name, currency')
      .eq('id', user?.id ?? '')
      .maybeSingle()
    profile = profileRow

    const { data: expenseRows } = await supabase
      .from('expenses')
      .select('id, merchant, category, amount, date')
      .eq('user_id', user?.id)
      .order('date', { ascending: false })
      .limit(4)
    expenses = expenseRows || []

    const { data: goals } = await supabase
      .from('goals')
      .select('title, current_amount, target_amount')
      .eq('user_id', user?.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
    topGoal = goals?.[0] ?? null

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { data: todayExpenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user?.id)
      .gte('date', today.toISOString())
    todayTotal = todayExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d
    })

    const { data: weekExpenses } = await supabase
      .from('expenses')
      .select('amount, date')
      .eq('user_id', user?.id)
      .gte('date', last7Days[0].toISOString())

    chartData = last7Days.map(day => {
      const dayStr = day.toLocaleDateString('en-IN', { weekday: 'short' })
      const total = (weekExpenses || [])
        .filter(e => {
          const d = new Date(e.date)
          return !isNaN(d.getTime()) && d.toDateString() === day.toDateString()
        })
        .reduce((sum, e) => sum + Number(e.amount), 0)
      return { label: dayStr, amount: total }
    })
  } catch (error) {
    console.error('Dashboard data load failed:', error)
  }

  const currency = profile?.currency || DEFAULT_CURRENCY
  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{greeting}, {displayName}</h1>
            <p className="text-muted-foreground mt-1">Your money overview for today.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/expenses">
              <Button className="rounded-full shadow-sm"><Plus className="w-4 h-4 mr-2" />Add expense</Button>
            </Link>
            <Link href="/coach">
              <Button variant="secondary" className="rounded-full shadow-sm"><MessageSquare className="w-4 h-4 mr-2" />Ask coach</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pt-4 pr-4"><CreditCard className="w-12 h-12" /></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatMoney(todayTotal, currency)}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                {todayTotal > 0 && <ArrowUpRight className="w-3 h-3 mr-1 text-destructive" />}
                {todayTotal > 0 ? 'Spent today' : 'Nothing logged yet today'}
              </p>
            </CardContent>
          </Card>

          {topGoal ? (
            <Card className="glass relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 pt-4 pr-4"><Target className="w-12 h-12" /></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Goal: {topGoal.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMoney(Number(topGoal.current_amount), currency)}</div>
                <div className="w-full bg-secondary rounded-full h-2 mt-3">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Number(topGoal.target_amount) > 0 ? Math.min(100, Math.round((Number(topGoal.current_amount) / Number(topGoal.target_amount)) * 100)) : 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {Number(topGoal.target_amount) > 0 ? Math.min(100, Math.round((Number(topGoal.current_amount) / Number(topGoal.target_amount)) * 100)) : 0}% of {formatMoney(Number(topGoal.target_amount || 0), currency)}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass relative overflow-hidden border-dashed">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">No active goals</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/goals">
                  <Button variant="outline" size="sm" className="mt-2 w-full">Create a goal</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="glass md:col-span-2 relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Quick tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/90">
                {expenses && expenses.length > 0
                  ? `You have ${expenses.length} recent expense${expenses.length > 1 ? 's' : ''}. Open Coach if you want help reviewing them.`
                  : 'Log a few expenses to start seeing patterns in your spending.'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 glass">
            <CardHeader>
              <CardTitle>Spending overview</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="pl-2 pt-4 border-t border-border/50">
              <SpendingChart data={chartData} currency={currency} />
            </CardContent>
          </Card>

          <Card className="col-span-3 glass">
            <CardHeader>
              <CardTitle>Recent transactions</CardTitle>
              <CardDescription>Latest expenses</CardDescription>
            </CardHeader>
            <CardContent>
              {expenses && expenses.length > 0 ? (
                <div className="space-y-6">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center">
                      <div className="bg-primary/10 h-10 w-10 rounded-full mr-4 flex items-center justify-center">
                        <span className="text-primary text-sm font-semibold">
                          {(expense.category || expense.merchant || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">{expense.merchant}</p>
                        <p className="text-xs text-muted-foreground">{expense.category}</p>
                      </div>
                      <div className="font-semibold text-sm">{formatMoney(Number(expense.amount), currency)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-3">
                  <p>No expenses yet.</p>
                  <Link href="/expenses">
                    <Button variant="outline" size="sm">Add your first expense</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
