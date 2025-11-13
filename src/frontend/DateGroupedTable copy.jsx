import React from 'react';
import { Table } from 'react-bootstrap'; // Or use react-bootstrap-table-next for more features

function DateGroupedTable({ data }) {
    const rawData = [
    { id: 1, date: '2025-10-26', event: 'Meeting' },
    { id: 2, date: '2025-10-27', event: 'Presentation' },
    { id: 3, date: '2025-10-26', event: 'Workshop' },
    { id: 4, date: '2025-10-28', event: 'Training' },
    ];

    const groupedData = rawData.reduce((acc, item) => {
        const date = item.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(item);
        return acc;
    }, {});

    // Convert to an array of objects for easier mapping in React
    const groupedDataArray = Object.entries(groupedData).map(([date, items]) => ({
        date,
        items,
    }));

    // Sort by date if needed
    groupedDataArray.sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <Table striped bordered hover>
        <thead>
            <tr>
            <th>Date</th>
            <th>Event</th>
            </tr>
        </thead>
        <tbody>
            {groupedDataArray.map((group) => (
            <React.Fragment key={group.date}>
                <tr>
                <td colSpan="2" className="table-secondary">
                    <strong>{group.date}</strong>
                </td>
                </tr>
                {group.items.map((item) => (
                <tr key={item.id}>
                    <td></td> {/* Empty cell for date column in item rows */}
                    <td>{item.event}</td>
                </tr>
                ))}
            </React.Fragment>
            ))}
        </tbody>
        </Table>
    );
}

export default DateGroupedTable;