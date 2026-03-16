import { z } from 'zod'

export const expenseSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().min(1),
  date: z.string().min(1),
  type: z.enum(['expense', 'income']).default('expense'),
  active: z.number().optional()
})

export const expenseUpdateSchema = expenseSchema.partial().extend({
  id: z.union([z.string(), z.number()])
})

export const debtSchema = z.object({
  person: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().min(1),
  due: z.string().min(1),
  status: z.enum(['owed-to-me', 'i-owe', 'paid']).default('owed-to-me'),
  monthlyPayment: z.number().nonnegative().optional(),
  paymentDay: z.string().optional(),
  totalPeriods: z.number().int().positive().optional(),
  paidPeriods: z.number().int().nonnegative().optional()
})

export const debtUpdateSchema = debtSchema.partial().extend({
  id: z.union([z.string(), z.number()])
})

export const budgetSchema = z.object({
  category: z.string().min(1),
  amount: z.number().positive(),
  period: z.enum(['monthly', 'yearly']).default('monthly'),
  alertThreshold: z.number().min(1).max(100).default(80),
  dailyLimit: z.number().positive().optional(),
  weeklyLimit: z.number().positive().optional(),
  blockOnExceed: z.boolean().default(false)
})

export const budgetUpdateSchema = budgetSchema.partial().extend({
  id: z.union([z.string(), z.number()])
})

export const recurringExpenseSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().min(1),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  nextDue: z.string().optional(),
  isActive: z.boolean().default(true)
})

export const recurringExpenseUpdateSchema = recurringExpenseSchema.partial().extend({
  id: z.union([z.string(), z.number()])
})

export const exportHistorySchema = z.object({
  filename: z.string().min(1),
  format: z.string().min(1),
  month: z.string().optional(),
  fileSize: z.string().optional()
})

export const deleteSchema = z.object({
  id: z.union([z.string(), z.number()]),
  reason: z.string().min(1)
})
