"use client";

import { useState, useTransition } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Target, PlusCircle, CheckCircle, Trash2, Loader2, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage, formatMoney, currencySymbol, DEFAULT_CURRENCY } from "@/lib/utils";
import { createGoal, deleteGoal, addFundsToGoal } from "./actions";

type Goal = {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  status: string;
  deadline?: string;
};

export default function GoalsClient({
  initialGoals,
  currency = DEFAULT_CURRENCY,
}: {
  initialGoals: Goal[];
  currency?: string;
}) {
  const symbol = currencySymbol(currency);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFundsModal, setShowFundsModal] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({ title: "", target: 0, deadline: "" });
  const [fundsAmount, setFundsAmount] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || newGoal.target <= 0) {
      toast.error("Please enter a valid goal title and target amount.");
      return;
    }
    startTransition(async () => {
      try {
        const saved = await createGoal({ title: newGoal.title, target: newGoal.target, deadline: newGoal.deadline });
        setGoals(prev => [{
          id: saved.id,
          title: saved.title,
          target_amount: Number(saved.target_amount),
          current_amount: Number(saved.current_amount),
          status: saved.status,
          deadline: saved.deadline ?? undefined,
        }, ...prev]);
        setShowAddModal(false);
        setNewGoal({ title: "", target: 0, deadline: "" });
        toast.success("Goal created");
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Failed to create goal."));
      }
    });
  };

  const handleDeleteGoal = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteGoal(id);
        setGoals(prev => prev.filter(g => g.id !== id));
        toast.success("Goal deleted.");
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Failed to delete goal."));
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleAddFunds = (goalId: string) => {
    const amount = parseFloat(fundsAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    startTransition(async () => {
      try {
        await addFundsToGoal(goalId, amount);
        setGoals(prev => prev.map(g => {
          if (g.id !== goalId) return g;
          const newCurrent = Number(g.current_amount) + amount;
          return {
            ...g,
            current_amount: newCurrent,
            status: newCurrent >= Number(g.target_amount) ? 'completed' : 'active',
          };
        }));
        setShowFundsModal(null);
        setFundsAmount("");
        toast.success(`${formatMoney(amount, currency)} added to goal!`);
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Failed to add funds."));
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
            <p className="text-muted-foreground mt-1">Track your savings targets and milestones.</p>
          </div>
          <Button className="rounded-full shadow-sm" onClick={() => setShowAddModal(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Goal
          </Button>

          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>Set a concrete financial target to stay motivated.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddGoal} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Vacation to Bali"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target Amount ({symbol})</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="100000"
                    value={newGoal.target || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, target: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Target Date (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Goal
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm gap-4 border-2 border-dashed rounded-2xl">
            <Target className="w-10 h-10 opacity-30" />
            <p>No goals yet. Create one to start saving!</p>
            <Button variant="outline" onClick={() => setShowAddModal(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create your first goal
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map(goal => {
              const percentage = Math.min(100, Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100));
              const isCompleted = goal.status === 'completed' || percentage >= 100;
              return (
                <Card key={goal.id} className={`glass flex flex-col justify-between hover:shadow-lg transition-shadow ${isCompleted ? 'border-green-500/30 bg-green-500/5' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                        <Target className={`h-5 w-5 ${isCompleted ? 'text-green-500' : 'text-primary'}`} />
                      </div>
                      <div className="flex items-center gap-1">
                        {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteGoal(goal.id)}
                          disabled={deletingId === goal.id}
                        >
                          {deletingId === goal.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    <CardTitle>{goal.title}</CardTitle>
                    {isCompleted && <p className="text-xs text-green-600 font-medium">Goal reached</p>}
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold">{formatMoney(goal.current_amount, currency)}</span>
                      <span className="text-muted-foreground">of {formatMoney(goal.target_amount, currency)}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-3">
                      <span>{percentage}% completed</span>
                      {goal.deadline && (
                        <span>
                          Target: {(() => {
                            const d = new Date(goal.deadline);
                            return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                          })()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  {!isCompleted && (
                    <CardFooter className="pt-0 border-t border-border/50 mt-4 px-6 py-4">
                      <Button
                      variant="ghost" size="sm"
                      className="w-full text-primary hover:text-primary/80"
                      onClick={() => { setShowFundsModal(goal.id); setFundsAmount(""); }}
                    >
                      <PlusIcon className="w-4 h-4 mr-1" /> Add Funds
                    </Button>

                    <Dialog open={showFundsModal === goal.id} onOpenChange={(o) => { if (!o) { setShowFundsModal(null); setFundsAmount(""); } }}>
                        <DialogContent className="sm:max-w-xs">
                          <DialogHeader>
                            <DialogTitle>Add Funds</DialogTitle>
                            <DialogDescription>How much are you adding to &quot;{goal.title}&quot;?</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3 py-4">
                            <Label>Amount ({symbol})</Label>
                            <Input
                              type="number"
                              placeholder="500"
                              value={fundsAmount}
                              onChange={(e) => setFundsAmount(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <DialogFooter>
                            <Button variant="ghost" onClick={() => setShowFundsModal(null)}>Cancel</Button>
                            <Button onClick={() => handleAddFunds(goal.id)} disabled={isPending}>
                              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                              Add
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
