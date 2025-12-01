import React from 'react';
import { Table } from 'react-bootstrap';
import {
  iconRegistry,
  categoryToIconKey,
  getColorForIconKey,
} from '../iconRegistry';

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
    category: '220px',
    paymentMethod: '150px',
  };

  const iconSize = 18;
  const circleSize = iconSize + 12; // similar padding to IconElement

  return (
    <div
      className="g-0"
      style={{
        width: '100%',
        backgroundColor: 'lightblue',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        paddingLeft: '1rem',
        overflow: 'hidden',
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
              {group.items.map((item) => {
                const iconKey = categoryToIconKey(item.category);
                const IconComponent = iconKey ? iconRegistry[iconKey] : null;
                const bgColor =
                  item.category_color || getColorForIconKey(iconKey);

                return (
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
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        {IconComponent && (
                          <div
                            style={{
                              width: circleSize,
                              height: circleSize,
                              borderRadius: '50%',
                              backgroundColor: bgColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <IconComponent size={iconSize} color="white" />
                          </div>
                        )}
                        <span>{item.category}</span>
                      </div>
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
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default DateGroupedTable;