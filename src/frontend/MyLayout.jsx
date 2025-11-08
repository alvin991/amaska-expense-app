import { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from './DataTable';
import MyModal from './MyModal';

function MyLayout() {
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

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
            console.log(response.data);
            // Transform data if necessary (e.g., map 'name' to label and 'id' to value)
            const formattedOptions = await response.data.map(item => ({
                label: item.name,
                value: item.id
            }));
            setCategories(formattedOptions);
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
            console.log(response.data);
            // Transform data if necessary (e.g., map 'name' to label and 'id' to value)
            const formattedOptions = await response.data.map(item => ({
                label: item.name,
                value: item.id
            }));
            setPaymentMethods(formattedOptions);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // fetch transactions from API
    const fetchTransactions = async () => {
        try {
            const response = await axios.get('/api/transactions'); // use relative URL so vite proxy handles it

            // Format dates in the full transaction data
            const formattedTransactions = response.data.map(tx => ({
                ...tx,
                transaction_date: tx.transaction_date ?
                    new Date(tx.transaction_date).toISOString().split('T')[0] : ''
            }));

            setTransactions(formattedTransactions);

            const filtered = formattedTransactions.map(tx => ({
                transaction_id: tx.transaction_id,
                date: tx.transaction_date,
                amount: tx.amount,
                merchant: tx.merchant,
                category: tx.category_name,
                paymentMethod: tx.payment_method_name,
                _hidden: ['transaction_id']
            }));

            setFilteredTransactions(filtered);
            console.log('Transactions loaded:', filtered.length);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        await fetchTransactions();
    };

    useEffect(() => {
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
    }, []);

    const handleRowDoubleClick = (transactionId) => {
        // If transactionId is null, it's a new transaction
        const transaction = transactionId ?
            transactions.find(t => t.transaction_id === transactionId) :
            null;

        setSelectedTransaction(transaction);
        setShowModal(true);
    };

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

    return (
        <div className="container" style={{ border: '1px solid black' }}>
            <div id="top-panel" className="row" style={{ height: '8vh', width: '100vw', backgroundColor: 'lightcoral' }}>
                Month
            </div>
            <div className="row" style={{ height: '2vh', width: '100vw', backgroundColor: 'lightpink' }}>
                line break
            </div>
            <div id="middle-panel" className="row" style={{ height: '30vh', width: '100vw', backgroundColor: 'lightyellow' }}>
                Charts Content
            </div>
            <div className="row" style={{ height: '2vh', width: '100vw', backgroundColor: 'lightgreen' }}>
                line break
            </div>
            <div id="bottom-panel" className="row" style={{ 
                height: '60vh', 
                width: '100vw', 
                backgroundColor: 'lightblue',
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem'
            }}>
                <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>TRANSACTIONS</h4>
                <div style={{ flex: 1, overflow: 'auto' }}>
                    <DataTable
                        data={dataWithEmptyRow}
                        onRowDoubleClick={handleRowDoubleClick}
                        emptyRowHeight={filteredTransactions.length ? undefined : '50px'} // Pass fixed height if no data
                        className="position-fixed"
                    />
                </div>
                <MyModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    transaction={selectedTransaction}
                    paymentMethods={paymentMethods}
                    categories={categories}
                    onSuccess={refreshData}
                />
            </div>
        </div>
    );
}

export default MyLayout;