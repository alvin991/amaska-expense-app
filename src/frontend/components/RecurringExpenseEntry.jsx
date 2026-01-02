// src/frontend/components/RecurringExpenseEntryPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Form, Container, Button, Row, Col } from 'react-bootstrap';
import ExpenseFormCoreFields from './ExpenseFormCoreFields';
import axios from 'axios';

function RecurringExpenseEntryPage({
  template = {},
  paymentMethods = [],
  categories = [],
  onHide,
  refreshRecurring,
}) {
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    paymentMethod: '',
    category: '',
    date: '',         // will be start_date
    notes: '',
  });
  const [schedule, setSchedule] = useState({
    frequency: 'monthly',
    interval: 1,
    end_date: '',
  });
  const [errors, setErrors] = useState({});
  const amountInputRef = useRef(null);

  // Initialise from existing template
  useEffect(() => {
    const amountNumber =
      typeof template.projected_amount === 'number'
        ? template.projected_amount
        : Number(template.projected_amount);

    setFormData({
      amount:
        !Number.isNaN(amountNumber) && amountNumber != null
          ? amountNumber.toFixed(2)
          : '',
      merchant: template.merchant ?? '',
      paymentMethod: template.projected_payment_method_id ?? '',
      category: template.projected_category_id ?? '',
      date: template.start_date ||
            new Date().toISOString().split('T')[0],
      notes: template.notes ?? '',
    });

    setSchedule({
      frequency: template.frequency || 'monthly',
      interval: template.interval || 1,
      end_date: template.end_date || '',
    });

    setErrors({});
  }, [template.id]);

  // You can reuse most of the handlers from TransactionEntryPage
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    const key = name === 'transaction_date' ? 'date' : name;
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleAmountChange = (e) => {
    let v = e.target.value;
    // Remove everything except digits and dot
    v = v.replace(/[^0-9.]/g, '');
    // Allow at most one dot
    const parts = v.split('.');
    if (parts.length > 2) {
      v = parts[0] + '.' + parts.slice(1).join('');
    }
    // Update form state as raw string
    setFormData(prev => ({ ...prev, amount: v }));
    // Update draft as number when possible, otherwise leave as previous
    const num = Number(v);
    onChangeDraft?.(prev => ({
      ...prev,
      amount: v === '' || Number.isNaN(num) ? prev.amount ?? 0 : num,
    }));
  };

  const handleAmountFocus = (e) => {
    // highlight entire value
    requestAnimationFrame(() => {
      const el = amountInputRef.current;
      if (!el) return;
      el.setSelectionRange(0, el.value.length);
    });
  };

  const handleAmountBlur = () => {
    const v = formData.amount;
    if (v === '' || v === null) return;

    const num = Number(v);
    if (Number.isNaN(num)) {
      setFormData(prev => ({ ...prev, amount: '' }));
      onChangeDraft?.(prev => ({ ...prev, amount: 0 }));
      setErrors(prev => ({ ...prev, amount: 'Amount must be numeric.' }));
      return;
    }

    const formatted = num.toFixed(2);
    setFormData(prev => ({ ...prev, amount: formatted }));
    onChangeDraft?.(prev => ({ ...prev, amount: num }));
  };
  const handlePaymentMethodChange = (e) => {
    const newId = parseInt(e.target.value) || '';
    setFormData(prev => ({ ...prev, paymentMethod: newId }));
  };

  const handleSelectCategory = () => {
    // if you want category-picker navigation, wire it like TransactionEntryPage
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setSchedule(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // TODO: add specific validation for recurring templates
    // For now we’ll just ensure amount/date/merchant/category/paymentMethod exist

    const payload = {
      id: template.id, // if editing
      name: template.name || formData.merchant, // or add a dedicated name field
      projected_amount: Number(formData.amount),
      notes: formData.notes,
      merchant: formData.merchant,
      projected_category_id: formData.category,
      projected_payment_method_id: formData.paymentMethod,
      frequency: schedule.frequency,
      interval: Number(schedule.interval) || 1,
      start_date: formData.date,
      end_date: schedule.end_date || null,
    };

    try {
      if (template.id) {
        await axios.put(`/api/recurring_expenses/${template.id}`, payload);
      } else {
        await axios.post('/api/recurring_expenses', payload);
      }
      await refreshRecurring?.();
      onHide?.();
    } catch (err) {
      console.error('Error saving recurring expense', err);
    }
  };

  return (
    <Container className="mt-3">
      <Form onSubmit={handleSubmit}>
        <ExpenseFormCoreFields
          formData={formData}
          errors={errors}
          paymentMethods={paymentMethods}
          categories={categories}
          amountInputRef={amountInputRef}
          onAmountChange={handleAmountChange}
          onAmountFocus={handleAmountFocus}
          onAmountBlur={handleAmountBlur}
          onFieldChange={handleFieldChange}
          onPaymentMethodChange={handlePaymentMethodChange}
          onSelectCategory={handleSelectCategory}
          dateLabel="Start Date"
          dateFieldName="transaction_date"
        />

        {/* Recurring-specific schedule fields */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Frequency</Form.Label>
              <Form.Select
                name="frequency"
                value={schedule.frequency}
                onChange={handleScheduleChange}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Interval</Form.Label>
              <Form.Control
                type="number"
                name="interval"
                min="1"
                value={schedule.interval}
                onChange={handleScheduleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={schedule.end_date}
                onChange={handleScheduleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-grid gap-2 mb-3">
          <Button variant="primary" type="submit">
            {template.id ? 'Update Recurring' : 'Create Recurring'}
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default RecurringExpenseEntryPage;