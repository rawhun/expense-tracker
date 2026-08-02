import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Target, BrainCircuit, CreditCard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SpendingChart } from "@/components/SpendingChart";
import { SeedDataButton } from "@/components/SeedDataButton";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;

  // Use maybeSingle() instead of single() — single() throws if no row exists, crashing the Server Component
  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user?.id ?? '')
    .maybeSingle();

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'there';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user?.id)
    .order('date', { ascending: false })
    .limit(4);

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user?.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);

  const topGoal = goals?.[0] ?? null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: todayExpenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', user?.id)
    .gte('date', today.toISOString());

  const todayTotal = todayExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0;

  // Build last-7-days chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const { data: weekExpenses } = await supabase
    .from('expenses')
    .select('amount, date')
    .eq('user_id', user?.id)
    .gte('date', last7Days[0].toISOString());

  const chartData = last7Days.map(day => {
    const dayStr = day.toLocaleDateString('en-IN', { weekday: 'short' });
    const total = (weekExpenses || [])
      .filter(e => {
        const d = new Date(e.date);
        return !isNaN(d.getTime()) && d.toDateString() === day.toDateString();
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { label: dayStr, amount: total };
  });

  const categoryEmojis: Record<string, string> = {
    'Food & Drinks': '🍔', 'Food': '🍔', 'Transport': '🚗',
    'Shopping': '🛒', 'Entertainment': '🎬', 'Health': '💊',
    'Groceries': '🛍️', 'Utilities': '💡', 'Education': '📚',
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{greeting}, {displayName} 👋</h1>
            <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your money today.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SeedDataButton />
            <Link href="/expenses">
              <Button className="rounded-full shadow-sm"><Sparkles className="w-4 h-4 mr-2" />Add Expense</Button>
            </Link>
            <Link href="/coach">
              <Button variant="secondary" className="rounded-full shadow-sm"><BrainCircuit className="w-4 h-4 mr-2" />Ask AI</Button>
            </Link>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pt-4 pr-4"><CreditCard className="w-12 h-12" /></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{todayTotal.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                {todayTotal > 0 && <ArrowUpRight className="w-3 h-3 mr-1 text-destructive" />}
                {todayTotal > 0 ? 'Spent today' : 'No expenses yet today'}
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
                <div className="text-2xl font-bold">₹{Number(topGoal.current_amount).toLocaleString('en-IN')}</div>
                <div className="w-full bg-secondary rounded-full h-2 mt-3">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${topGoal.target_amount > 0 ? Math.min(100, Math.round((Number(topGoal.current_amount) / Number(topGoal.target_amount)) * 100)) : 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {topGoal.target_amount > 0 ? Math.min(100, Math.round((Number(topGoal.current_amount) / Number(topGoal.target_amount)) * 100)) : 0}% of ₹{Number(topGoal.target_amount || 0).toLocaleString('en-IN')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass relative overflow-hidden border-dashed">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">No Active Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/goals">
                  <Button variant="outline" size="sm" className="mt-2 w-full">Create a Goal</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="glass md:col-span-2 relative overflow-hidden border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-primary">
                <Sparkles className="w-4 h-4 mr-2" /> AI Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/90 font-medium">
                {expenses && expenses.length > 0
                  ? `You've logged ${expenses.length} expense${expenses.length > 1 ? 's' : ''} recently. Ask your AI coach for personalized tips on your spending!`
                  : 'Start logging expenses to get personalized AI insights about your spending habits.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Transactions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 glass">
            <CardHeader>
              <CardTitle>Spending Overview</CardTitle>
              <CardDescription>Your recent expense distribution.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2 pt-4 border-t border-border/50">
              <SpendingChart data={chartData} />
            </CardContent>
          </Card>

          <Card className="col-span-3 glass">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest expenses.</CardDescription>
            </CardHeader>
            <CardContent>
              {expenses && expenses.length > 0 ? (
                <div className="space-y-6">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full mr-4">
                        <span className="text-primary text-xl">
                          {categoryEmojis[expense.category] || '💸'}
                        </span>
                      </div>
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">{expense.merchant}</p>
                        <p className="text-xs text-muted-foreground">{expense.category}</p>
                      </div>
                      <div className="font-semibold text-sm">₹{Number(expense.amount).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-3">
                  <p>No expenses yet.</p>
                  <Link href="/expenses">
                    <Button variant="outline" size="sm">Log your first expense</Button>
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
