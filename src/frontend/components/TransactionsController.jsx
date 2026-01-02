import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardCharts from './dashboard/DashboardCharts';
import MySearchBox from './MySearchBox';
import DateGroupedTable from './DateGroupedTable.jsx';
import { formatLocalDate } from '../utils/dateUtils';
import useExpenseStore from '../store/useExpenseStore';

function TransactionsController({ onOpenModal, registerRefreshTransactions }) {
  const {
    categories,
    transactions,
    setTransactions,
    setCategoriesUsed,
    setSelectedTransaction,
    setSelectedRecurringTemplate,
  } = useExpenseStore();

  const [transactionSearchQuery, setTransactionSearchQuery] = useState('');
  const [chartDataByCategory, setChartDataByCategory] = useState([]);
  const [chartDataByPaymentMethod, setChartDataByPaymentMethod] = useState([]);
  const [periodTotalAmount, setPeriodTotalAmount] = useState(0.0);
  const [leftToSpendData, setLeftToSpendData] = useState([]);
  const [leftToSpend, setLeftToSpend] = useState('0.00');
  const [monthName, setMonthName] = useState('');
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

  const updateMonthName = useCallback(() => {
    const d = new Date(currentYear, currentMonth, 1);
    const monthNameStr = d.toLocaleString('default', { month: 'long' });
    setMonthName(`${monthNameStr}, ${currentYear}`);
  }, [currentYear, currentMonth]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = {
        start_date: formatLocalDate(firstDayOfMonth),
        end_date: formatLocalDate(lastDayOfMonth),
      };
      const response = await axios.get('/api/transactions', { params: queryParams });
      const formattedTransactions = JSON.parse(JSON.stringify(response.data));

      setTransactions(formattedTransactions);
      setCategoriesUsed(new Set(formattedTransactions.map((tx) => tx.category_id)));

      const totalAmount = response.data.reduce((acc, tx) => acc + tx.amount, 0);
      const leftToSpendValue = (BudgetByMonth - totalAmount).toFixed(2);

      setPeriodTotalAmount(totalAmount.toFixed(2));
      setLeftToSpend(leftToSpendValue);
      setLeftToSpendData([
        { name: 'Left to Spend', value: Number(leftToSpendValue), fill: '#00C49F' },
        { name: 'Spent', value: Number(totalAmount), fill: '#FF8042' },
      ]);

      setChartDataByCategory(formatData(response.data, 'category_name'));
      setChartDataByPaymentMethod(formatData(response.data, 'payment_method_name'));

      updateMonthName();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [BudgetByMonth, firstDayOfMonth, lastDayOfMonth, setCategoriesUsed, setTransactions, updateMonthName]);

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
      <DashboardHeader
        monthName={monthName}
        budgetByMonth={BudgetByMonth}
        periodTotalAmount={periodTotalAmount}
        currentYear={currentYear}
        currentMonth={currentMonth}
        onChangeMonth={handleChangeMonth}
      />

      <div className="row line-break" style={{ height: '2vh', width: '100%' }} />

      <DashboardCharts
        leftToSpendData={leftToSpendData}
        leftToSpend={leftToSpend}
        chartDataByCategory={chartDataByCategory}
        chartDataByPaymentMethod={chartDataByPaymentMethod}
      />

      <div className="row line-break" style={{ height: '2vh', width: '100%' }} />

      <div
        id="bottom-panel"
        className="row"
        style={{
          height: '60vh',
          width: '100%',
          backgroundColor: 'lightblue',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>TRANSACTIONS</h4>

        <MySearchBox
          onQueryChange={setTransactionSearchQuery}
          placeholder="Search Merchant, Category or Payment Method"
        />

        <div
          style={{
            paddingLeft: '1.7rem',
            paddingRight: '1.7rem',
            marginBottom: '0.5rem',
          }}
        >
          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={handleNewTransactionClick}
          >
            New Transaction
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', paddingRight: '0px !important' }}>
          <DateGroupedTable
            data={filteredTransactions}
            onRowDoubleClick={handleRowDoubleClick}
            className="position-fixed"
            categories={categories}
          />
        </div>
      </div>
    </>
  );
}

export default TransactionsController;
