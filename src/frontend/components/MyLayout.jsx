import { useEffect, useState } from 'react';
import axios from 'axios';
import ModalBase from './ModalBase.jsx';
import BaseTabsPage from './BaseTabsPage';
import useExpenseStore from '../store/useExpenseStore';
import TransactionsController from './TransactionsController.jsx';
import RecurringController from './RecurringController.jsx';

function MyLayout() {
    const [activeTab, setActiveTab] = useState('/expenses-main');
    const [users, setUsers] = useState([]);
    const {
        setCategories,
        setPaymentMethods,
    } = useExpenseStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    // selection now lives in the expense store
    //Using key={transactionKey} forces React to unmount/remount ModalBase whenever double‑click (even the same row)
    const [transactionKey, setTransactionKey] = useState(0);
    const [refreshTransactionsFn, setRefreshTransactionsFn] = useState(null);
    const [refreshRecurringFn, setRefreshRecurringFn] = useState(null);

    const isRecurringTab = activeTab === '/expenses-second';

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

    const refreshTransactions      = async () => { if (refreshTransactionsFn) { await refreshTransactionsFn(); } };
    const refreshCategories        = async () => { await fetchCategories(); };
    const refreshPaymentMethods    = async () => { await fetchPaymentMethods(); };
    const refreshRecurringExpenses = async () => { if (refreshRecurringFn) { await refreshRecurringFn(); } };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                await Promise.all([
                    fetchUsers(),
                    fetchPaymentMethods(),
                    fetchCategories(),
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const openModal = () => {
        setTransactionKey(prev => prev + 1);
        setShowModal(true);
    };

    const handleHideModal = () => {
        setShowModal(false);
    };

    return (
        <div className="container mt-4">
            <BaseTabsPage
                activeKey={activeTab}
                onSelect={(key) => {
                    if (!key) return;
                    setActiveTab(key);
                }}
                tabs={[
                    { key: '/expenses-main', title: 'Daily Expenses' },
                    { key: '/expenses-second', title: 'Recurring Expenses' },
                ]}
            />

            {activeTab === '/expenses-main' && (
                <TransactionsController
                    onOpenModal={openModal}
                    registerRefreshTransactions={setRefreshTransactionsFn}
                />
            )}

            {activeTab === '/expenses-second' && (
                <RecurringController
                    onOpenModal={openModal}
                    registerRefreshRecurring={setRefreshRecurringFn}
                />
            )}

            <ModalBase
                key={transactionKey}
                isOpen={showModal}
                refreshTransactions={refreshTransactions}
                refreshCategories={refreshCategories}
                refreshPaymentMethods={refreshPaymentMethods}
                onHide={handleHideModal}
                isRecurring={isRecurringTab}
                refreshRecurringExpenses={refreshRecurringExpenses}
            />
        </div>
    );
}

export default MyLayout;