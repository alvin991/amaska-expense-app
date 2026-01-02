import axios from 'axios';
import type { RecurringExpenseInput } from '../types/expenses';

export async function listRecurringExpenses(): Promise<RecurringExpenseInput[]> {
  const res = await axios.get<RecurringExpenseInput[]>('/api/recurring_expenses');
  return res.data;
}

export async function saveRecurringExpense(input: RecurringExpenseInput): Promise<void> {
  const payload = {
    ...input,
    projected_amount: Number(input.projected_amount),
    interval: input.interval ?? 1,
  };

  if (input.id) {
    await axios.put(`/api/recurring_expenses/${input.id}`, payload);
  } else {
    await axios.post('/api/recurring_expenses', payload);
  }
}

export async function deleteRecurringExpense(id: number): Promise<void> {
  await axios.delete(`/api/recurring_expenses/${id}`);
}

export async function applyRecurringExpenses(upToDate?: string): Promise<void> {
  await axios.post('/api/recurring_expenses/apply', upToDate ? { upToDate } : {});
}
