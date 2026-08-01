import { getExpenses } from "./actions"
import ExpensesClient from "./ExpensesClient"

export default async function ExpensesPage() {
  const expenses = await getExpenses()
  return <ExpensesClient initialExpenses={expenses} />
}
