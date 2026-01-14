import { formatLocalDate } from '../utils/dateUtils';

// Transaction
export const DEFAULT_TRANSACTION = {
  transaction_id: null,
  projected_amount: 0.0,
  amount: 0.0,
  merchant: '',
  projected_transaction_date: '',
  transaction_date: formatLocalDate(new Date()),   // local yyyy-mm-dd
  notes: '',
  category_id: '',
  category_name: '',
  payment_method_id: '',
  payment_method_name: '',
};

export const DEFAULT_RECURRING_TEMPLATE = {
  id: null,
  name: '',
  projected_amount: 0.0,
  merchant: '',
  projected_category_id: '',
  projected_payment_method_id: '',
  start_date: formatLocalDate(new Date()), // local yyyy-mm-dd
  frequency: 'monthly',
  interval: 1,
  notes: '',
  enabled: true,
};

// Category
export const DEFAULT_CATEGORY = {
  id: null,
  name: '',
  description: '',
  color: '',
  icon: '',
};

// Color palette for ColorSelect
export const DEFAULT_COLORS = [
  '#2196f3', // blue
  '#4caf50', // green
  '#ff9800', // orange
  '#f44336', // red
  '#9c27b0', // purple
  '#795548', // brown
  '#607d8b', // blue-grey
  '#00bcd4', // cyan
  '#e91e63', // pink
  '#8bc34a', // light green
  '#ffc107', // amber
  '#3f51b5', // indigo
  '#9e9e9e', // grey
  '#ff5722', // deep orange
  '#673ab7', // deep purple
];