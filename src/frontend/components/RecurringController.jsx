import { useCallback, useEffect, useMemo, useState } from 'react';
import RecurringExpensesTab from './RecurringExpensesTab';
import { listRecurringExpenses } from '../services/recurringExpensesService';
import { getRecurringExpenseRelatedTransactions } from '../services/transactionService';
import useExpenseStore from '../store/useExpenseStore';

function RecurringController({ onOpenModal, registerRefreshRecurring }) {
  const {
    recurringExpenses,
    setRecurringExpenses,
    setSelectedRecurringExpense,
    setSelectedRecurringExpenseRelatedTransactions,
    setSelectedTransaction,
  } = useExpenseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecurringExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listRecurringExpenses();
      setRecurringExpenses(data);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [setRecurringExpenses]);

  useEffect(() => {
    fetchRecurringExpenses();
  }, [fetchRecurringExpenses]);

  // Register refresh callback with parent (MyLayout)
  useEffect(() => {
    if (registerRefreshRecurring) {
      registerRefreshRecurring(() => fetchRecurringExpenses);
    }
  }, [fetchRecurringExpenses, registerRefreshRecurring]);

  const filteredRecurringExpenses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return recurringExpenses || [];

    return (recurringExpenses || []).filter((item) => {
      const name = item.name ? String(item.name).toLowerCase() : '';
      const merchant = item.merchant ? String(item.merchant).toLowerCase() : '';
      return name.includes(q) || merchant.includes(q);
    });
  }, [recurringExpenses, searchQuery]);

  const handleRowDoubleClick = async (recurringExpenseId) => {
    const recurringExpense = recurringExpenseId
      ? recurringExpenses.find((r) => r.id === recurringExpenseId)
      : null;
    setSelectedRecurringExpense(recurringExpense || null);
    const relatedTransactions = await getRecurringExpenseRelatedTransactions(recurringExpenseId);
    setSelectedRecurringExpenseRelatedTransactions(relatedTransactions || []);
    // setSelectedTransaction(null);
    if (onOpenModal) {
      onOpenModal();
    }
  };

  const handleNewRecurringClick = () => {
    setSelectedRecurringExpense(null);
    // setSelectedTransaction(null);
    if (onOpenModal) {
      onOpenModal();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <RecurringExpensesTab
      title="Recurring Expenses"
      onSearchChange={setSearchQuery}
      placeholder="Search Name, Merchant"
      onNewClick={handleNewRecurringClick}
      newLabel="New Recurring Expense"
      filteredTransactions={filteredRecurringExpenses}
      handleRowDoubleClick={handleRowDoubleClick}
    />
  );
}

export default RecurringController;
