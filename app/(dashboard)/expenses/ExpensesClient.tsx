"use client";

import { useState, useTransition } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Send, Loader2, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage, formatMoney, currencySymbol, DEFAULT_CURRENCY } from "@/lib/utils";
import { saveExpense, deleteExpense } from "./actions";

type Expense = {
  id: string;
  amount: number;
  merchant: string;
  category: string;
  subcategory?: string;
  payment_method?: string;
  notes?: string;
  date: string;
  is_impulse?: boolean;
  is_recurring?: boolean;
};

type ParsedExpense = {
  amount: number;
  merchant: string;
  category: string;
  subcategory?: string;
  payment_method?: string;
  notes?: string;
  date: string;
  confidence?: number;
  is_recurring?: boolean;
  is_impulse?: boolean;
};

export default function ExpensesClient({
  initialExpenses,
  currency = DEFAULT_CURRENCY,
}: {
  initialExpenses: Expense[];
  currency?: string;
}) {
  const symbol = currencySymbol(currency);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedExpense | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isSaving, startSaveTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleProcessExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/ai/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_text: inputText }),
      });
      const data = await res.json();
      if (data.success) {
        setParsedData({ ...data.data, amount: parseFloat(data.data.amount) });
        setShowConfirmModal(true);
        toast.success("Expense details ready to review");
      } else {
        throw new Error(data.error);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Something went wrong parsing this expense."));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveExpense = () => {
    if (!parsedData) return;
    startSaveTransition(async () => {
      try {
        const saved = await saveExpense(parsedData);
        if (!saved?.id) throw new Error("Expense saved but no id returned.");
        setExpenses(prev => [{
          id: saved.id,
          amount: Number(saved.amount ?? parsedData.amount),
          merchant: saved.merchant ?? parsedData.merchant,
          category: saved.category ?? parsedData.category,
          subcategory: saved.subcategory ?? parsedData.subcategory,
          payment_method: saved.payment_method ?? parsedData.payment_method,
          notes: saved.notes ?? parsedData.notes,
          date: saved.date ?? parsedData.date,
          is_impulse: saved.is_impulse ?? parsedData.is_impulse,
          is_recurring: saved.is_recurring ?? parsedData.is_recurring,
        }, ...prev]);
        setShowConfirmModal(false);
        setInputText("");
        setParsedData(null);
        toast.success("Expense saved to your account!");
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Failed to save expense."));
      }
    });
  };

  const handleDeleteExpense = (id: string) => {
    setDeletingId(id);
    startSaveTransition(async () => {
      try {
        await deleteExpense(id);
        setExpenses(prev => prev.filter(e => e.id !== id));
        toast.success("Expense deleted.");
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Failed to delete expense."));
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground mt-1">Log new expenses and view your history.</p>
          </div>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Add expense</CardTitle>
            <CardDescription>Type it naturally, e.g. &quot;Spent {symbol}350 on tea and snacks today&quot;</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProcessExpense} className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="What did you spend on?"
                className="flex-1 text-base h-12 bg-background"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isProcessing}
              />
              <Button type="submit" size="lg" className="h-12 w-full sm:w-auto" disabled={isProcessing || !inputText.trim()}>
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" />Add</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Expense History */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>
              {expenses.length > 0
                ? `${expenses.length} expense${expenses.length > 1 ? 's' : ''} logged`
                : 'No expenses yet — log your first one above'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
                <p>Your expense history will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-accent/50 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-full flex items-center justify-center h-12 w-12 text-primary font-bold text-lg">
                        {expense.category?.charAt(0) || symbol}
                      </div>
                      <div>
                        <h4 className="font-semibold text-base">{expense.merchant}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{expense.category}</span>
                          {expense.notes && <><span>•</span><span>{expense.notes}</span></>}
                          {expense.is_impulse && (
                            <span className="text-destructive flex items-center gap-0.5">
                              <AlertCircle className="w-3 h-3" /> impulse
                            </span>
                          )}
                          {expense.is_recurring && (
                            <span className="text-primary">🔁 recurring</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {(() => {
                            const d = new Date(expense.date);
                            return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                          })()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                      <span className="font-bold text-lg">{formatMoney(expense.amount, currency)}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteExpense(expense.id)}
                          disabled={deletingId === expense.id}
                        >
                          {deletingId === expense.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Trash2 className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirm Modal */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm expense</DialogTitle>
              <DialogDescription>
                Check the details below and edit anything that looks off before saving.
              </DialogDescription>
            </DialogHeader>
            {parsedData && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount ({symbol})</Label>
                    <Input
                      type="number"
                      value={parsedData.amount}
                      onChange={(e) => setParsedData({ ...parsedData, amount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Merchant</Label>
                    <Input
                      value={parsedData.merchant}
                      onChange={(e) => setParsedData({ ...parsedData, merchant: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={parsedData.category}
                      onChange={(e) => setParsedData({ ...parsedData, category: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Input
                      value={parsedData.payment_method || ""}
                      onChange={(e) => setParsedData({ ...parsedData, payment_method: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={parsedData.notes || ""}
                    onChange={(e) => setParsedData({ ...parsedData, notes: e.target.value })}
                  />
                </div>
                {parsedData.is_impulse && (
                  <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Flagged as a possible impulse buy — are you sure?</span>
                  </div>
                )}
                {parsedData.confidence !== undefined && parsedData.confidence < 0.7 && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-3 py-2 rounded-md">
                    Low confidence ({Math.round((parsedData.confidence ?? 0) * 100)}%). Double-check these details.
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="ghost" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveExpense} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
