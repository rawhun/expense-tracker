import { getGoals } from "./actions"
import GoalsClient from "./GoalsClient"

export default async function GoalsPage() {
  const goals = await getGoals()
  return <GoalsClient initialGoals={goals} />
}
