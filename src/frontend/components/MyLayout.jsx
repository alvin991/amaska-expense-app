import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import DateGroupedTable from './DateGroupedTable.jsx';
import Modal from 'react-bootstrap/Modal';
import ModalBase from './ModalBase.jsx';
import MySearchBox from './MySearchBox';
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardCharts from './dashboard/DashboardCharts';

function MyLayout() {
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    let [filteredTransactions, setFilteredTransactions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [chartDataByCategory, setChartDataByCategory] = useState([]);
    const [chartDataByPaymentMethod, setChartDataByPaymentMethod] = useState([]);
    const [periodTotalAmount, setPeriodTotalAmount] = useState(0.00);
    const [leftToSpendData, setLeftToSpendData] = useState([]);
    const [leftToSpend, setLeftToSpend] = useState('0.00');
    const [monthName, setMonthName] = useState('');
    const [categoriesUsed, setCategoriesUsed] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    // NEW: year/month state
    const today = new Date();

    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-based

    // local variables
    let BudgetByMonth = 2000;
    let period = '2024-06'; // YYYY-MM format (can be updated later)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth  = new Date(currentYear, currentMonth + 1, 0);

    // call APIs to load data
    // fetch users from API
    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users'); // use relative URL so vite proxy handles it
            setUsers(response.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // fetch categories from API
    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories'); // use relative URL so vite proxy handles it
            setCategories(response.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // fetch payment methods from API
    const fetchPaymentMethods = async () => {
        try {
            const response = await axios.get('/api/payment_methods'); // use relative URL so vite proxy handles it
            setPaymentMethods(response.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // fetch transactions from API (uses currentYear/currentMonth via first/lastDayOfMonth)
    const fetchTransactions = async () => {
        try {
            const queryParams = {
                start_date: firstDayOfMonth.toISOString().split('T')[0],
                end_date:   lastDayOfMonth.toISOString().split('T')[0],
            };
            const response = await axios.get('/api/transactions', { params: queryParams });

            const formattedTransactions = response.data.map(tx => ({
                ...tx,
                transaction_date: tx.transaction_date
                    ? new Date(tx.transaction_date).toISOString().split('T')[0]
                    : ''
            }));

            setTransactions(formattedTransactions);
            setCategoriesUsed(new Set(formattedTransactions.map(tx => tx.category_id)));

            const totalAmount = response.data.reduce((acc, tx) => acc + tx.amount, 0);
            const leftToSpendValue = (BudgetByMonth - totalAmount).toFixed(2);

            setPeriodTotalAmount(totalAmount.toFixed(2));
            setLeftToSpend(leftToSpendValue);
            setLeftToSpendData([
                { name: 'Left to Spend', value: Number(leftToSpendValue), fill: '#00C49F' },
                { name: 'Spent',        value: Number(totalAmount),      fill: '#FF8042' }
            ]);

            function formatData(responseData, groupByField) {
                let result = responseData.reduce((accumulator, currentItem) => {
                    const key = currentItem[groupByField];
                    const value = currentItem.amount;
                    if (!accumulator[key]) accumulator[key] = 0;
                    accumulator[key] += value;
                    return accumulator;
                }, {});
                result = Array.from(Object.entries(result), ([name, value]) => ({ name, value }));
                result.forEach(item => {
                    item.fill = '#' + Math.floor(Math.random() * 16777215).toString(16);
                });
                return result;
            }

            setChartDataByCategory(formatData(response.data, 'category_name'));
            setChartDataByPaymentMethod(formatData(response.data, 'payment_method_name'));


            const filtered = formattedTransactions.map(tx => ({
                transaction_id: tx.transaction_id,
                date:           tx.transaction_date,
                amount:         tx.amount,
                merchant:       tx.merchant,
                category:       tx.category_name,
                category_id:     tx.category_id,
                paymentMethod:  tx.payment_method_name,
                _hidden:        ['transaction_id']
            }));

            setFilteredTransactions(filtered);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshTransactions      = async () => { await fetchTransactions(); };
    const refreshCategories        = async () => { await fetchCategories(); };
    const refreshPaymentMethods    = async () => { await fetchPaymentMethods(); };

    useEffect(() => {
        const today = new Date();
        const monthNameStr = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();
        setMonthName(`${monthNameStr}, ${year}`);

        const fetchAllData = async () => {
            try {
                await Promise.all([
                    fetchUsers(),
                    fetchPaymentMethods(),
                    fetchCategories(),
                    fetchTransactions()
                ]);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // NEW: when currentYear/currentMonth change, refetch and update header
    useEffect(() => {
        const d = new Date(currentYear, currentMonth, 1);
        const monthNameStr = d.toLocaleString('default', { month: 'long' });
        setMonthName(`${monthNameStr}, ${currentYear}`);
        fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentYear, currentMonth]);

    const handleRowDoubleClick = (transactionId) => {
        // If transactionId is null, it's a new transaction
        const transaction = transactionId ?
            transactions.find(t => t.transaction_id === transactionId) :
            null;

        setSelectedTransaction(transaction);
        setShowModal(true);
    };

    const normalizedTransactions = useMemo(
        () =>
          transactions.map((tx) => ({
            transaction_id: tx.transaction_id,
            date: tx.transaction_date,
            amount: tx.amount,
            merchant: tx.merchant,
            category: tx.category_name,
            category_id:     tx.category_id,
            paymentMethod: tx.payment_method_name,
          })),
        [transactions]
      );
      
      filteredTransactions = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return normalizedTransactions;
    
        const keys = ['merchant', 'category', 'paymentMethod'];
    
        return normalizedTransactions.filter((item) =>
          keys.some((key) => {
            const value = item[key];
            if (value == null) return false;
            return String(value).toLowerCase().includes(q);
          })
        );
      }, [normalizedTransactions, searchQuery]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    // Add empty row to filtered transactions
    const dataWithEmptyRow = [
        {
            transaction_id: null,
            date: '\u00A0', // Non-breaking space to maintain height
            amount: '\u00A0',
            merchant: '',
            category: '\u00A0',
            paymentMethod: '\u00A0',
            _hidden: ['transaction_id'],
            _emptyRow: true // Flag to identify empty row
        },
        ...filteredTransactions
    ];

    const handleNewTransactionClick = () => {
        // open modal with no selected transaction
        setSelectedTransaction(null);
        setShowModal(true);
    };

    const handleChangeMonth = (year, monthIndex0Based) => {
        setCurrentYear(year);
        setCurrentMonth(monthIndex0Based);
    };

    return (
        <div className="container">
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

            <div id="bottom-panel" className="row" style={{ 
                height: '60vh', 
                width: '100%', 
                backgroundColor: 'lightblue',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>TRANSACTIONS</h4>

                {/* Search box (keeps existing width/layout) */}
                <MySearchBox
                    onQueryChange={setSearchQuery}
                />

                {/* New Transaction button, same width as search box */}
                <div style={{ paddingLeft: '1.7rem', paddingRight: '1.7rem', marginBottom: '0.5rem' }}>
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
                <ModalBase
                  paymentMethods={paymentMethods}
                  categories={categories}
                  propTransaction={selectedTransaction}
                  categoriesUsed={categoriesUsed}
                  isOpen={showModal}
                  refreshTransactions={refreshTransactions}
                  refreshCategories={refreshCategories}
                  refreshPaymentMethods={refreshPaymentMethods}
                  onHide={() => setShowModal(false)}
                />
            </div>
        </div>
    );
}

export default MyLayout;