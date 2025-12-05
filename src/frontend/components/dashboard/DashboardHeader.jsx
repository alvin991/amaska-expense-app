////javascript
// filepath: c:\alvin\code\react\amaska-expense-app\src\frontend\components\dashboard\DashboardHeader.jsx
// ...existing code...
import { useState } from 'react';
import MonthPickerPanel from '../MonthPickerPanel.jsx';

function DashboardHeader({
  monthName,
  budgetByMonth,
  periodTotalAmount,
  currentYear,
  currentMonth,
  onChangeMonth, // (year, monthIndex0Based) => void
}) {
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const handleDateDoubleClick = () => {
    setShowMonthPicker(true);
  };

  const handleCloseMonthPicker = (payload) => {
    setShowMonthPicker(false);
    if (payload?.currentYear && payload?.currentMonth) {
      // payload.currentMonth is 1-12
      onChangeMonth?.(payload.currentYear, payload.currentMonth - 1);
    }
  };

  return (
    <div
      id="top-panel"
      className="row d-flex justify-content-center"
      style={{
        height: '8vh',
        width: '100%',
        alignItems: 'center',
        paddingLeft: '1%',
        paddingRight: '1%',
      }}
    >
      <div
        style={{
          border: '2px solid #ccc',
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <div
          className="col-md-4"
          style={{ paddingTop: '1%', paddingBottom: '1%' }}
          onDoubleClick={handleDateDoubleClick}
        >
          <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>{monthName}</h4>
          {showMonthPicker && (
            <MonthPickerPanel
              currentYear={currentYear}
              currentMonth={currentMonth + 1} // convert 0-based to 1-12 if needed
              onClose={handleCloseMonthPicker}
            />
          )}
        </div>
        <div
          className="col-md-4 custom-border-td"
          style={{ paddingTop: '1%', paddingBottom: '1%' }}
        >
          <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>
            Budget: ${budgetByMonth}
          </h4>
        </div>
        <div
          className="col-md-4 custom-border-td"
          style={{ paddingTop: '1%', paddingBottom: '1%' }}
        >
          <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>
            Spent: ${periodTotalAmount}
          </h4>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
// ...existing code...