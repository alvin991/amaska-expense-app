import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const MonthPickerPanel = ({ onClose }) => {
  const initialDate = new Date();

  const [selectedMonth, setSelectedMonth] = useState(initialDate);
  const [currentYear, setCurrentYear]     = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth]   = useState(initialDate.getMonth() + 1); // 1-12

  const handleChange = (date) => {
    if (!date) return;
    setSelectedMonth(date);
    setCurrentYear(date.getFullYear());
    setCurrentMonth(date.getMonth() + 1);
  };

  const handleHide = () => {
    // Pass year/month up to MyLayout
    onClose?.({
      selectedMonth,
      currentYear,
      currentMonth, // 1-12
    });
  };

  return (
    <Modal show onHide={handleHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Select Month ({currentYear}-{String(currentMonth).padStart(2, '0')})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="date-picker-panel">
          <DatePicker
            selected={selectedMonth}
            onChange={handleChange}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            inline
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleHide}>
          Select and Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MonthPickerPanel;