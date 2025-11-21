import React from 'react';
import Table from 'react-bootstrap/Table';

function DataTable({ data, onRowDoubleClick, emptyRowHeight }) {
  if (!data || data.length === 0) {
    return <p>No data to display.</p>;
  }

  // Get visible columns by filtering out hidden ones
  const columns = Object.keys(data[0]).filter(col => 
    col !== '_hidden' && col !== '_emptyRow' && !data[0]._hidden?.includes(col)
  );

  // custom column headings map
  const columnHeadings = {
    date: 'Date',
    amount: 'Amount',
    merchant: 'Merchant',
    category: 'Category',
    paymentMethod: 'Paid By'
    // add more mappings as needed
  };

  // custom column widths map (add or adjust widths as needed)
  const columnWidths = {
    date: '120px',
    amount: '110px',
    merchant: '240px',
    category: '160px',
    paymentMethod: '150px'
    // fallback width will be used for columns not listed here
  };

  const formatCell = (column, value) => {
    if (column === 'amount' && value !== '\u00A0') {
      return `$${Number(value).toFixed(2)}`;
    }
    return value;
  };

  return (
    <Table bordered hover responsive size="sm">
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th
              key={index}
              style={{ width: columnWidths[column] ?? '100px' }}
            >
              {columnHeadings[column] ?? column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr 
            key={rowIndex}
            onDoubleClick={() => onRowDoubleClick?.(row.transaction_id)}
            style={{ 
              cursor: 'pointer',
              height: row._emptyRow ? emptyRowHeight : undefined,
              backgroundColor: row._emptyRow ? '#f8f9fa' : undefined
            }}
          >
            {columns.map((column, colIndex) => (
              <td
                key={colIndex}
                style={{
                  width: columnWidths[column] ?? '100px',
                  textAlign: column === 'amount' ? 'right' : 'left'
                }}
                className="ps-3"
              >
                {formatCell(column, row[column])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default DataTable;