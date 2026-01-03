import { useCallback, useEffect, useMemo, useState } from 'react';
import RecurringTemplatesTab from './RecurringTemplatesTab';
import { listRecurringTemplates } from '../services/recurringTemplatesService';
import { getRecurringTemplateRelatedTransactions } from '../services/transactionService';
import useExpenseStore from '../store/useExpenseStore';

function RecurringController({ onOpenModal, registerRefreshRecurring }) {
  const {
    recurringTemplates,
    setRecurringTemplates,
    setSelectedRecurringTemplate,
    setSelectedRecurringTemplateRelatedTransactions,
    setSelectedTransaction,
  } = useExpenseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecurringTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listRecurringTemplates();
      setRecurringTemplates(data);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [setRecurringTemplates]);

  useEffect(() => {
    fetchRecurringTemplates();
  }, [fetchRecurringTemplates]);

  // Register refresh callback with parent (MyLayout)
  useEffect(() => {
    if (registerRefreshRecurring) {
      registerRefreshRecurring(() => fetchRecurringTemplates);
    }
  }, [fetchRecurringTemplates, registerRefreshRecurring]);

  const filteredRecurringTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return recurringTemplates || [];

    return (recurringTemplates || []).filter((item) => {
      const name = item.name ? String(item.name).toLowerCase() : '';
      const merchant = item.merchant ? String(item.merchant).toLowerCase() : '';
      return name.includes(q) || merchant.includes(q);
    });
  }, [recurringTemplates, searchQuery]);

  const handleRowDoubleClick = async (recurringTemplateId) => {
    const recurringTemplate = recurringTemplateId
      ? recurringTemplates.find((r) => r.id === recurringTemplateId)
      : null;
    setSelectedRecurringTemplate(recurringTemplate || null);
    const relatedTransactions = await getRecurringTemplateRelatedTransactions(recurringTemplateId);
    setSelectedRecurringTemplateRelatedTransactions(relatedTransactions || []);
    // setSelectedTransaction(null);
    if (onOpenModal) {
      onOpenModal();
    }
  };

  const handleNewRecurringClick = () => {
    setSelectedRecurringTemplate(null);
    // setSelectedTransaction(null);
    if (onOpenModal) {
      onOpenModal();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <RecurringTemplatesTab
      title="Recurring Templates"
      onSearchChange={setSearchQuery}
      placeholder="Search Name, Merchant"
      onNewClick={handleNewRecurringClick}
      newLabel="New Recurring Template"
      filteredTransactions={filteredRecurringTemplates}
      handleRowDoubleClick={handleRowDoubleClick}
    />
  );
}

export default RecurringController;
