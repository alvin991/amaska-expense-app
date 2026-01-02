// Shared domain types for the expenses app

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTemplateInput {
  id?: number;
  name: string;
  projected_amount: number;
  notes?: string;
  merchant?: string;
  projected_category_id: number;
  projected_payment_method_id?: number | null;
  frequency: RecurringFrequency;
  interval?: number;
  start_date: string; // YYYY-MM-DD
  end_date?: string | null;
  next_run_date?: string; // optional when updating
  enabled?: boolean;
}