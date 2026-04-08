export function computeFinanceSummary(items = [], debts = []) {
  const expenseItems = items.filter(i => i?.type === 'expense')
  const incomeItems = items.filter(i => i?.type === 'income')

  const totalExpense = expenseItems.reduce((sum, i) => sum + (Number(i?.amount) || 0), 0)
  const totalIncome = incomeItems.reduce((sum, i) => sum + (Number(i?.amount) || 0), 0)

  const debtFlow = debts.reduce((sum, d) => {
    const amount = Number(d?.amount) || 0
    if (d?.status === 'owed-to-me') return sum + amount
    if (d?.status === 'borrowed') return sum - amount
    return sum
  }, 0)

  const balance = totalIncome - totalExpense
  const netWorthApprox = balance + debtFlow

  const incomePercent = totalIncome > 0 ? Math.min(100, Math.round((totalIncome / ((totalIncome + totalExpense) || 1)) * 100)) : 0
  const expensePercent = totalExpense > 0 ? Math.min(100, Math.round((totalExpense / ((totalIncome + totalExpense) || 1)) * 100)) : 0

  return {
    totalExpense,
    totalIncome,
    debtFlow,
    balance,
    netWorthApprox,
    expenseCount: expenseItems.length,
    incomeCount: incomeItems.length,
    incomePercent,
    expensePercent,
    expenseItems,
    incomeItems
  }
}
