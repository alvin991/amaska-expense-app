import axios from 'axios';

export async function saveTransaction(transaction) {
  const payload = {
    amount: parseFloat(transaction.amount) || 0,
    notes: transaction.notes,
    transaction_date: transaction.transaction_date || transaction.date,
    merchant: transaction.merchant,
    category_id: transaction.category_id ? Number(transaction.category_id) : null,
    payment_method_id: transaction.payment_method_id ? Number(transaction.payment_method_id) : null,
  };

  if (transaction.transaction_id) {
    await axios.put(`/api/transactions/${transaction.transaction_id}`, payload);
  } else {
    await axios.post('/api/transactions', payload);
  }
}

export async function deleteTransactionById(id) {
  await axios.delete(`/api/transactions/${id}`);
}

export async function getRecurringExpenseRelatedTransactions(id) {
  const res = await axios.get(`/api/recurring_expenses_related_transactions/${id}`);
  return res.data;
}