import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Form, Container, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { saveRecurringTemplate } from '../services/recurringTemplatesService';
import type { RecurringFrequency } from '../types/expenses';
import { RECURRING_FREQUENCIES } from '../types/expenses';

interface PaymentMethod {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface RecurringFormData {
  name: string;
  amount: string;
  merchant: string;
  paymentMethod: string;
  category: string;
  start_date: string;
  end_date: string;
  notes: string;
}

interface RecurringSchedule {
  frequency: RecurringFrequency;
  interval: number;
}

interface RecurringErrors {
  name?: string;
  amount?: string;
  merchant?: string;
  category?: string;
  paymentMethod?: string;
  start_date?: string;
}

interface RecurringTemplateEntryPageProps {
  template?: any;
  paymentMethods?: PaymentMethod[];
  categories?: Category[];
  onHide?: () => void;
  refreshRecurringTemplates?: () => Promise<void>;
  relatedCount?: number;
  onViewRelated?: () => void;
}

function RecurringTemplateEntryPage({
  template = {},
  paymentMethods = [],
  categories = [],
  onHide,
  refreshRecurringTemplates,
    relatedCount,
    onViewRelated,
}: RecurringTemplateEntryPageProps) {
  const [formData, setFormData] = useState<RecurringFormData>({
    name: '',
    amount: '',
    merchant: '',
    paymentMethod: '',
    category: '',
    start_date: '',
    end_date: '',
    notes: '',
  });

  const [schedule, setSchedule] = useState<RecurringSchedule>({
    frequency: 'monthly',
    interval: 1,
  });

  const [errors, setErrors] = useState<RecurringErrors>({});
  const [enabled, setEnabled] = useState<boolean>(
    template.enabled !== undefined ? Boolean(template.enabled) : true,
  );
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const amountNumber =
      typeof template.projected_amount === 'number'
        ? template.projected_amount
        : Number(template.projected_amount);

    setFormData({
      name: template.name || '',
      amount:
        !Number.isNaN(amountNumber) && amountNumber != null
          ? amountNumber.toFixed(2)
          : '',
      merchant: template.merchant ?? '',
      paymentMethod:
        template.projected_payment_method_id != null
          ? String(template.projected_payment_method_id)
          : '',
      category:
        template.projected_category_id != null
          ? String(template.projected_category_id)
          : '',
      start_date:
        template.start_date || new Date().toISOString().split('T')[0],
      end_date: template.end_date || '',
      notes: template.notes ?? '',
    });

    setSchedule({
      frequency: (template.frequency as RecurringFrequency) || 'monthly',
      interval: template.interval || 1,
    });

    setEnabled(
      template.enabled !== undefined ? Boolean(template.enabled) : true,
    );

    setErrors({});
  }, [template.id]);

  const handleBasicChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    v = v.replace(/[^0-9.]/g, '');
    const parts = v.split('.');
    if (parts.length > 2) {
      v = parts[0] + '.' + parts.slice(1).join('');
    }
    setFormData((prev) => ({ ...prev, amount: v }));
  };

  const handleAmountFocus = () => {
    requestAnimationFrame(() => {
      const el = amountInputRef.current;
      if (!el) return;
      el.setSelectionRange(0, el.value.length);
    });
  };

  const handleAmountBlur = () => {
    const v = formData.amount;
    if (v === '' || v == null) return;

    const num = Number(v);
    if (Number.isNaN(num)) {
      setFormData((prev) => ({ ...prev, amount: '' }));
      setErrors((prev) => ({ ...prev, amount: 'Amount must be numeric.' }));
      return;
    }

    const formatted = num.toFixed(2);
    setFormData((prev) => ({ ...prev, amount: formatted }));
  };

  const handleScheduleChange = (
    e: ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === 'frequency') {
      setSchedule((prev) => ({
        ...prev,
        frequency: value as RecurringFrequency,
      }));
    } else if (name === 'interval') {
      setSchedule((prev) => ({
        ...prev,
        interval: Number(value) || 1,
      }));
    }
  };

  const validate = () => {
    const nextErrors: RecurringErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Name is required.';
    if (!formData.amount) nextErrors.amount = 'Amount is required.';
    if (!formData.merchant.trim()) nextErrors.merchant = 'Merchant is required.';
    if (!formData.category) nextErrors.category = 'Category is required.';
    if (!formData.paymentMethod) nextErrors.paymentMethod = 'Payment method is required.';
    if (!formData.start_date) nextErrors.start_date = 'Start date is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      id: template.id,
      name: formData.name,
      projected_amount: Number(formData.amount),
      notes: formData.notes,
      merchant: formData.merchant,
      projected_category_id: Number(formData.category),
      projected_payment_method_id: Number(formData.paymentMethod),
      frequency: schedule.frequency,
      interval: Number(schedule.interval) || 1,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      enabled,
    };

    try {
      await saveRecurringTemplate(payload);
      await refreshRecurringTemplates?.();
      onHide?.();
    } catch (err) {
      console.error('Error saving recurring expense:', err);
    }
  };

  return (
    <Container className="mt-3">
      <Form onSubmit={handleSubmit}>
        {/* Name */}
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleBasicChange}
            isInvalid={!!errors.name}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Amount */}
        <Form.Group className="mb-3">
          <Form.Label>Planned Amount</Form.Label>
          <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control
              ref={amountInputRef}
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleAmountChange}
              onFocus={handleAmountFocus}
              onBlur={handleAmountBlur}
              placeholder="0.00"
              isInvalid={!!errors.amount}
            />
            <Form.Control.Feedback type="invalid">
              {errors.amount}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>

        {/* Merchant */}
        <Form.Group className="mb-3">
          <Form.Label>Merchant</Form.Label>
          <Form.Control
            type="text"
            name="merchant"
            value={formData.merchant}
            onChange={handleBasicChange}
            isInvalid={!!errors.merchant}
          />
          <Form.Control.Feedback type="invalid">
            {errors.merchant}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Category */}
        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select
            name="category"
            value={formData.category}
            onChange={handleBasicChange}
            isInvalid={!!errors.category}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.category}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Payment method */}
        <Form.Group className="mb-3">
          <Form.Label>Payment Method</Form.Label>
          <Form.Select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleBasicChange}
            isInvalid={!!errors.paymentMethod}
          >
            <option value="">Select payment method</option>
            {paymentMethods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.paymentMethod}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Schedule */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Frequency</Form.Label>
              <Form.Select
                name="frequency"
                value={schedule.frequency}
                onChange={handleScheduleChange}
              >
                {RECURRING_FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </option>
                ))}
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
                value={formData.end_date}
                onChange={handleBasicChange}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Start date */}
        <Form.Group className="mb-3">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleBasicChange}
            isInvalid={!!errors.start_date}
          />
          <Form.Control.Feedback type="invalid">
            {errors.start_date}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Notes */}
        <Form.Group className="mb-3">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            name="notes"
            value={formData.notes}
            onChange={handleBasicChange}
            rows={3}
          />
        </Form.Group>

        <div className="d-flex align-items-center justify-content-between mb-3">
          <Form.Check
            type="switch"
            id="recurring-enabled-switch"
            label="Enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />

          <Button
            variant="outline-primary"
            size="sm"
            disabled={!template.id || !onViewRelated}
            onClick={onViewRelated}
          >
            View all related transactions
            {typeof relatedCount === 'number' ? ` (${relatedCount})` : ''}
          </Button>
        </div>

        <div className="d-grid gap-2 mb-3">
          <Button variant="primary" type="submit">
            {template.id ? 'Update Recurring Expense' : 'Create Recurring Expense'}
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default RecurringTemplateEntryPage;
