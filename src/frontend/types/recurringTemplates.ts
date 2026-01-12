import type { RecurringFrequency } from './expenses';

export interface RecurringFormData {
  name: string;
  amount: string;
  merchant: string;
  paymentMethod: string;
  category: string;
  start_date: string;
  end_date: string;
  notes: string;
}

export interface RecurringSchedule {
  frequency: RecurringFrequency;
  interval: number;
}

export interface RecurringErrors {
  name?: string;
  amount?: string;
  merchant?: string;
  category?: string;
  paymentMethod?: string;
  start_date?: string;
}

export interface RecurringTemplate {
  id?: number;
  name?: string;
  projected_amount?: number;
  merchant?: string;
  projected_payment_method_id?: number;
  projected_category_id?: number;
  start_date?: string;
  end_date?: string;
  notes?: string;
  enabled?: boolean;
  frequency?: RecurringFrequency;
  interval?: number;
}

export interface PaymentMethod {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}
