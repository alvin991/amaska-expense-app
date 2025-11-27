import React from 'react';
import { Table } from 'react-bootstrap';

function DateGroupedTable({ data, onRowDoubleClick }) {
  if (!data || data.length === 0) {
    return <p>No data to display.</p>;
  }

  const groupedData = Object.values(
    data.reduce((accumulator, currentItem) => {
      const { date, amount } = currentItem;
      if (!accumulator[date]) {
        accumulator[date] = {
          date,
          items: [],
          total_amount: 0,
        };
      }
      accumulator[date].items.push(currentItem);
      accumulator[date].total_amount += amount;
      return accumulator;
    }, {})
  );

  groupedData.sort((b, a) => new Date(a.date) - new Date(b.date));

  const columnWidths = {
    date: '120px',
    amount: '110px',
    merchant: '240px',
    category: '160px',
    paymentMethod: '150px',
  };

  return (
    <div
      id="bottom-panel"
      className="g-0"
      style={{
        /* let height grow; parent decides scroll */
        width: '100%',
        backgroundColor: 'lightblue',
        display: 'flex',
        flexDirection: 'column',
        // padding: '1rem',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        paddingLeft: '1rem',
        overflow: 'hidden', // no inner scrollbars
      }}
    >
      <Table
        bordered
        hover
        responsive={false}
        style={{
          width: '100%',
          tableLayout: 'fixed',
          marginBottom: 0,
        }}
      >
        <tbody>
          <tr onDoubleClick={() => onRowDoubleClick?.(null)}>
            <td colSpan="4">Create New Transaction</td>
          </tr>
          {groupedData.map((group) => (
            <React.Fragment key={group.date}>
              <tr>
                <td colSpan="4">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <span>
                      <strong>{group.date}</strong>
                    </span>
                    <span>
                      <strong>${group.total_amount.toFixed(2)}</strong>
                    </span>
                  </div>
                </td>
              </tr>
              {group.items.map((item) => (
                <tr
                  key={item.transaction_id}
                  onDoubleClick={() =>
                    onRowDoubleClick?.(item.transaction_id)
                  }
                >
                  <td style={{ width: columnWidths.merchant }}>
                    {item.merchant}
                  </td>
                  <td style={{ width: columnWidths.category }}>
                    {item.category}
                  </td>
                  <td style={{ width: columnWidths.paymentMethod }}>
                    {item.paymentMethod}
                  </td>
                  <td
                    className="text-end"
                    style={{ width: columnWidths.amount }}
                  >
                    ${item.amount.toFixed(2)}
                  </td>
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