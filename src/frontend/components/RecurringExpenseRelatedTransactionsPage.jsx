import React from 'react';
import { Table } from 'react-bootstrap';

function RecurringExpenseRelatedTransactionsPage({
  recurringExpenseId,
  transactions,
  onRowDoubleClick,
}) {
  const rows = Array.isArray(transactions) ? [...transactions] : [];

  // Sort by transaction_date (newest first) if available
  rows.sort((a, b) => {
    const da = a.transaction_date ? new Date(a.transaction_date) : 0;
    const db = b.transaction_date ? new Date(b.transaction_date) : 0;
    return db - da;
  });

  if (!rows.length) {
    return <p>No related transactions found for this recurring expense.</p>;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <h5 style={{ margin: 0 }}>
        Transactions History {recurringExpenseId ? ` (Template #${recurringExpenseId})` : ''}
      </h5>

      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <Table
          bordered
          hover
          responsive={false}
          style={{ marginBottom: 0, tableLayout: 'fixed' }}
        >
          <thead>
            <tr>
              <th style={{ width: '140px' }}>Date</th>
              <th style={{ width: '240px' }}>Projected Amount</th>
              <th style={{ width: '120px' }}>Amount</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx) => (
              <tr
                key={tx.id}
                onDoubleClick={() => onRowDoubleClick?.(tx)}
              >
                <td>{tx.transaction_date}</td>
                <td className="text-end">${Number(tx.projected_amount || 0).toFixed(2)}</td>
                <td className="text-end">${Number(tx.amount || 0).toFixed(2)}</td>
                <td>{tx.notes}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default RecurringExpenseRelatedTransactionsPage;
