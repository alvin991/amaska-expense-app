import { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from './DataTable';
import MyModal from './MyModal';
import PieChartWithCustomizedLabel from './PieChart1';
import PieChartHasTextInside from './PieChart2';

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
    const [chartDataByCategory, setChartDataByCategory] = useState([]);
    const [chartDataByPaymentMethod, setChartDataByPaymentMethod] = useState([]);
    const [periodTotalAmount, setPeriodTotalAmount] = useState(0.00);
    const [leftToSpendData, setLeftToSpendData] = useState([]);
    const [leftToSpend, setLeftToSpend] = useState('0.00');
    const [monthName, setMonthName] = useState('');

    // local variables
    let BudgetByMonth = 2000;
    let period = '2024-06'; // YYYY-MM format

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

            // setPeriodTotalAmount(response.data.reduce((accumulator, currentValue) => {
            //     return accumulator + currentValue.amount;
            // }, 0)); // The initial value of the accumulator is 0)

            // Calculate totals directly
            const totalAmount = response.data.reduce((acc, tx) => acc + tx.amount, 0);
            const leftToSpendValue = (BudgetByMonth - totalAmount).toFixed(2);

            setPeriodTotalAmount(totalAmount.toFixed(2));
            setLeftToSpend(leftToSpendValue);

            // Use the freshly calculated values here, not state!
            setLeftToSpendData([
                { name: 'Left to Spend', value: Number(leftToSpendValue), fill: '#00C49F' },
                { name: 'Spent', value: Number(totalAmount), fill: '#FF8042' }
            ]);
            console.log(`leftToSpendData: ${JSON.stringify([
                { name: 'Left to Spend', value: Number(leftToSpendValue), fill: '#00C49F' },
                { name: 'Spent', value: Number(totalAmount), fill: '#FF8042' }
            ])}`);

            function formatData(responseData, groupByField) {
                let result = responseData.reduce((accumulator, currentItem) => {
                    const key = currentItem[groupByField];
                    const value = currentItem.amount;

                    if (!accumulator[key]) {
                        accumulator[key] = 0; // Initialize the sum for a new key
                    }
                    accumulator[key] += value; // Add the current item's value to the key's sum

                    return accumulator;
                }, {})

                result = Array.from(Object.entries(result), ([name, value]) => ({ name, value }))

                result.forEach(item => {
                    item.fill = '#' + Math.floor(Math.random()*16777215).toString(16); // random color
                });

                return result;
            }

            setChartDataByCategory(response.data.map(tx => ({
                name: tx.category_name,
                value: tx.amount,
                fill: '#' + Math.floor(Math.random()*16777215).toString(16) // random color
            })));

            setChartDataByCategory(formatData(response.data, 'category_name'));
            setChartDataByPaymentMethod(formatData(response.data, 'payment_method_name'));


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
        const today = new Date(); // Or any other Date object, e.g., new Date('2025-06-15')

        // Get the full month name in the default locale
        const monthName = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();
        setMonthName(`${monthName}, ${year}`);

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
        <div className="container">
            <div id="top-panel" className="row d-flex justify-content-center" style={{ height: '8vh', width: '100vw', alignItems: 'center', paddingLeft: '1%', paddingRight: '1%' }}>
                <div style={{ border: '2px solid #ccc', display: 'flex', justifyContent: 'center' }}>
                    <div className='col-md-4' style={{ paddingTop: '1%', paddingBottom: '1%' }}>
                        <h4 style={{ margin: 0, marginBottom: '0.5rem' }}> {monthName} </h4>
                    </div>
                    <div className='col-md-4 custom-border-td' style={{ paddingTop: '1%', paddingBottom: '1%' }}>
                        <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>Budget:  ${ BudgetByMonth }</h4>
                    </div>
                    <div className='col-md-4 custom-border-td' style={{ paddingTop: '1%', paddingBottom: '1%' }}>
                        <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>Spent:  ${ periodTotalAmount }</h4>
                    </div>
                </div>
            </div>
            <div className="row line-break" style={{ height: '2vh', width: '100vw' }} />
            <div id="middle-panel" className="row d-flex justify-content-center" style={{ height: '30vh', width: '100vw' }}>
                <div className='col-md-4'>
                    <PieChartHasTextInside chartData={leftToSpendData} heading='LEFT TO SPEND' centerLabel={ '$' + leftToSpend} />
                </div>
                <div className='col-md-4'>
                    <PieChartWithCustomizedLabel chartData={chartDataByCategory} heading='CATEGORY' />
                </div>
                <div className='col-md-4'>
                    <PieChartWithCustomizedLabel chartData={chartDataByPaymentMethod} heading='PAY BY' />
                </div>
            </div>
            <div className="row line-break" style={{ height: '2vh', width: '100vw' }} />
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