import React from 'react';
import { Table } from 'react-bootstrap'; // Or use react-bootstrap-table-next for more features
import rawData from './../db/data.json'; // Adjust path if needed

function DateGroupedTable({ data, onRowDoubleClick }) {
    // const rawData = [
    //     { id: 1, transaction_date: '2025-10-26', event: 'Meeting', amount: 100 },
    //     { id: 2, transaction_date: '2025-10-27', event: 'Presentation', amount: 150 },
    //     { id: 3, transaction_date: '2025-10-26', event: 'Workshop', amount: 200 },
    //     { id: 4, transaction_date: '2025-10-28', event: 'Training', amount: 250 },
    // ];

    // console.log(rawData);

    const groupedData = Object.values(
        rawData.reduce((accumulator, currentItem) => {
            const { transaction_date, amount } = currentItem;
            // console.log(`Processing item: date=${transaction_date}, amount=${amount}`);
            // If the date is not yet in the accumulator, create a new entry
            if (!accumulator[transaction_date]) {
                accumulator[transaction_date] = {
                    date: transaction_date,
                    items: [],
                    total_amount: 0,
                };
            }
            // Add the event and amount to the existing or new entry
            accumulator[transaction_date].items.push(currentItem);
            accumulator[transaction_date].total_amount += currentItem.amount;

            return accumulator;
        }, {})
    );

    const columns = Object.keys(rawData[0]).filter(col => 
        col !== '_hidden' && col !== '_emptyRow' && !rawData[0]._hidden?.includes(col)
    );
    // console.log(`columns ${JSON.stringify(columns, null, 2)}`);

    // console.log(`groupedData ${JSON.stringify(groupedData, null, 2)}`);

    // Convert to an array of objects for easier mapping in React
    // const groupedDataArray = Object.entries(groupedData).map(([date, items, total_amount]) => ({
    //     date,
    //     items,
    //     total_amount
    // }));

    // console.log(`groupedDataArray ${JSON.stringify(groupedDataArray, null, 2)}`);

    // Sort by date if needed
    groupedData.sort((b, a) => new Date(a.date) - new Date(b.date));

    // console.log(`sorted groupedDataArray ${JSON.stringify(groupedData, null, 2)}`);

    // custom column widths map (add or adjust widths as needed)
    const columnWidths = {
        date: '120px',
        amount: '110px',
        merchant: '240px',
        category: '160px',
        paymentMethod: '150px'
        // fallback width will be used for columns not listed here
    };
    // console.log(`columnWidths ${JSON.stringify(columnWidths, null, 2)}`);

    return (
        <div id="bottom-panel" className="row" style={{ 
            height: '60vh', 
            width: '100vw', 
            backgroundColor: 'lightblue',
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem'
        }}>
        <Table bordered hover responsive>
            <tbody>
                <tr onDoubleClick={() => onRowDoubleClick?.(null)}>
                    <td colSpan="4">
                        Create New Transaction
                    </td>
                </tr>
                {groupedData.map((group) => (
                <React.Fragment key={group.date}>
                    <tr>
                        <td colSpan="4">
                            <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                                <span><strong>{group.date}</strong></span>
                                <span><strong>${group.total_amount.toFixed(2)}</strong></span>
                            </div>
                        </td>
                    </tr>
                    {group.items.map((item) => (
                    <tr key={item.transaction_id} onDoubleClick={() => onRowDoubleClick?.(item.transaction_id)}>
                        <td style={{ width: columnWidths.merchant }}>{item.merchant} { columnWidths[1] }</td>
                        <td style={{ width: columnWidths.category }}>{item.category_name}</td>
                        <td style={{ width: columnWidths.paymentMethod }}>{item.payment_method_name}</td>
                        <td className="text-end" style={{ width: columnWidths.amount}}>${item.amount.toFixed(2)}</td>
                    </tr>
                    ))}
                </React.Fragment>
                ))}
            </tbody>
        </Table>
        </div>
    );
}

export default DateGroupedTable;