import { useCallback, useEffect, useMemo, useState } from 'react';
import TransactionsTab from './TransactionsTab.jsx';
import { formatLocalDate } from '../utils/dateUtils';
import useExpenseStore from '../store/useExpenseStore';
import { getTransactions } from '../services/transactionService.js';

function TransactionsController({ onOpenModal, registerRefreshTransactions }) {

  // transactions means non-recurring transactions here ( recurring_template_id is null )
  const {
    categories,
    transactions,
    setTransactions,
    setCategoriesUsed,
    setSelectedTransaction,
    setSelectedRecurringTemplate,
  } = useExpenseStore();

  const [transactionSearchQuery, setTransactionSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-based

  const BudgetByMonth = 2000; // TODO: make configurable later if needed

  const firstDayOfMonth = useMemo(
    () => new Date(currentYear, currentMonth, 1),
    [currentYear, currentMonth]
  );
  const lastDayOfMonth = useMemo(
    () => new Date(currentYear, currentMonth + 1, 0),
    [currentYear, currentMonth]
  );

  const formatData = (responseData, groupByField) => {
    let result = responseData.reduce((accumulator, currentItem) => {
      const key = currentItem[groupByField];
      const value = currentItem.amount;
      if (!accumulator[key]) accumulator[key] = 0;
      accumulator[key] += value;
      return accumulator;
    }, {});
    result = Array.from(Object.entries(result), ([name, value]) => ({ name, value }));
    result.forEach((item) => {
      item.fill = '#' + Math.floor(Math.random() * 16777215).toString(16);
    });
    return result;
  };

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = {
        start_date: formatLocalDate(firstDayOfMonth),
        end_date: formatLocalDate(lastDayOfMonth),
      };
      const response = await getTransactions(queryParams);
      const formattedTransactions = JSON.parse(JSON.stringify(response));

      setTransactions(formattedTransactions);
      setCategoriesUsed(new Set(formattedTransactions.map((tx) => tx.category_id)));
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [firstDayOfMonth, lastDayOfMonth, setCategoriesUsed, setTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Register refresh callback with parent (MyLayout)
  useEffect(() => {
    if (registerRefreshTransactions) {
      registerRefreshTransactions(() => fetchTransactions);
    }
  }, [fetchTransactions, registerRefreshTransactions]);

  const handleChangeMonth = (year, monthIndex0Based) => {
    setCurrentYear(year);
    setCurrentMonth(monthIndex0Based);
  };

  const monthName = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    const monthNameStr = d.toLocaleString('default', { month: 'long' });
    return `${monthNameStr}, ${currentYear}`;
  }, [currentYear, currentMonth]);

  const normalizedTransactions = useMemo(
    () =>
      transactions.map((tx) => ({
        transaction_id: tx.transaction_id,
        date: tx.transaction_date,
        amount: tx.amount,
        merchant: tx.merchant,
        category: tx.category_name,
        category_id: tx.category_id,
        paymentMethod: tx.payment_method_name,
      })),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    const q = transactionSearchQuery.trim().toLowerCase();
    if (!q) return normalizedTransactions;

    const keys = ['merchant', 'category', 'paymentMethod'];

    return normalizedTransactions.filter((item) =>
      keys.some((key) => {
        const value = item[key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(q);
      })
    );
  }, [normalizedTransactions, transactionSearchQuery]);

  const { periodTotalAmount, leftToSpend, leftToSpendData } = useMemo(() => {
    const totalAmount = transactions.reduce((acc, tx) => acc + tx.amount, 0);
    const leftToSpendValue = BudgetByMonth - totalAmount;

    return {
      periodTotalAmount: totalAmount.toFixed(2),
      leftToSpend: leftToSpendValue.toFixed(2),
      leftToSpendData: [
        { name: 'Left to Spend', value: Number(leftToSpendValue.toFixed(2)), fill: '#00C49F' },
        { name: 'Spent', value: Number(totalAmount.toFixed(2)), fill: '#FF8042' },
      ],
    };
  }, [transactions, BudgetByMonth]);

  const chartDataByCategory = useMemo(
    () => formatData(transactions, 'category_name'),
    [transactions]
  );

  const chartDataByPaymentMethod = useMemo(
    () => formatData(transactions, 'payment_method_name'),
    [transactions]
  );

  const handleRowDoubleClick = (rowId) => {
    const transaction = rowId
      ? transactions.find((t) => t.transaction_id === rowId)
      : null;
    setSelectedTransaction(transaction || null);
    setSelectedRecurringTemplate(null);
    if (onOpenModal) {
      onOpenModal();
    }
  };

  const handleNewTransactionClick = () => {
    setSelectedTransaction(null);
    setSelectedRecurringTemplate(null);
    if (onOpenModal) {
      onOpenModal();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <TransactionsTab
        dashboardHeader={{
            monthName,
            budgetByMonth: BudgetByMonth,
            periodTotalAmount,
            currentYear,
            currentMonth,
            onChangeMonth: handleChangeMonth
        }}
        charts={{
            leftToSpendData,
            leftToSpend,
            chartDataByCategory,
            chartDataByPaymentMethod
        }}
        dataTableHeader={{
            title: "TRANSACTIONS",
            onSearchChange: setTransactionSearchQuery,
            placeholder: "Search Merchant, Category or Payment Method",
            onNewClick: handleNewTransactionClick,            
            newButtonLabel: "New Transaction",
        }}
        dataTable={{
            data: filteredTransactions,
            onRowDoubleClick: handleRowDoubleClick,
            categories
        }}
      />
    </>
  );
}

export default TransactionsController;
