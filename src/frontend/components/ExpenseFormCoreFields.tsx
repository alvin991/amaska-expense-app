import type React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import IconElement from './IconElement';
import { iconRegistry, iconsFromDb } from '../iconRegistry';

interface ExpenseFormCoreFieldsProps {
  formData: {
    amount: string;
    merchant: string;
    paymentMethod: string;
    category: number | null;
    date: string;
    notes: string;
  };
  errors: {
    amount?: string;
    merchant?: string;
    paymentMethod?: string;
    category?: string;
    date?: string;
  };
  paymentMethods: { id: string; name: string }[];
  categories: { id: number; name: string; icon?: string; color?: string }[];
  amountInputRef: React.RefObject<HTMLInputElement>;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAmountFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  onAmountBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPaymentMethodChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSelectCategory: () => void;
  dateLabel?: string;
  dateFieldName?: string;
}

function ExpenseFormCoreFields({
  formData,
  errors,
  paymentMethods,
  categories,
  amountInputRef,
  onAmountChange,
  onAmountFocus,
  onAmountBlur,
  onFieldChange,           // merchant, notes, date-like field
  onPaymentMethodChange,
  onSelectCategory,
  dateLabel = 'Date',
  dateFieldName = 'date',
}: ExpenseFormCoreFieldsProps) {
  const getSelectedCategory = () =>
    categories.find(c => c.id === formData.category) || null;

  return (
    <>
      {/* Amount */}
      <Form.Group className="mb-3">
        <Form.Label>Amount</Form.Label>
        <InputGroup>
          <InputGroup.Text>$</InputGroup.Text>
          <Form.Control
            ref={amountInputRef}
            type="text"
            name="amount"
            value={formData.amount}
            onChange={onAmountChange}
            onFocus={onAmountFocus}
            onBlur={onAmountBlur}
            placeholder="0.00"
            className="amount-input"
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
          onChange={onFieldChange}
          placeholder="Enter merchant name"
          isInvalid={!!errors.merchant}
        />
        <Form.Control.Feedback type="invalid">
          {errors.merchant}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Payment Method */}
      <Form.Group className="mb-3">
        <Form.Label>Payment Method</Form.Label>
        <Form.Select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={onPaymentMethodChange}
          isInvalid={!!errors.paymentMethod}
        >
          <option value="">Select payment method</option>
          {paymentMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.name}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.paymentMethod}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Category (icon + fake dropdown) */}
      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <InputGroup>
          {(() => {
            const selected = getSelectedCategory();
            const iconKey = selected?.icon;
            const iconInfo =
              iconsFromDb?.find(ic => ic.id === iconKey) ||
              (selected ? { label: selected.name } : { label: '' });
            const IconComponent = iconKey
              ? (iconRegistry as Record<string, React.ComponentType<any>>)[iconKey]
              : null;

            return IconComponent ? (
              <InputGroup.Text
                className="category-input-icon category-clickable"
                onClick={onSelectCategory}
              >
                <IconElement
                  iconKey={iconKey}
                  label={iconInfo.label}
                  size={16}
                  color={selected?.color || '#2196f3'}
                  showLabel={false}
                />
              </InputGroup.Text>
            ) : (
              <InputGroup.Text className="category-input-icon" />
            );
          })()}

          <Form.Control
            type="text"
            readOnly
            className="category-input-control category-clickable"
            value={getSelectedCategory()?.name || ''}
            placeholder="Select Category"
            onClick={onSelectCategory}
            isInvalid={!!errors.category}
          />

          <InputGroup.Text
            className="category-input-caret category-clickable"
            onClick={onSelectCategory}
          >
            ▾
          </InputGroup.Text>
        </InputGroup>

        {errors.category && (
          <div style={{ color: '#dc3545', marginTop: 4, fontSize: '.875em' }}>
            {errors.category}
          </div>
        )}
      </Form.Group>

      {/* Date-like field (configurable) */}
      <Form.Group className="mb-3">
        <Form.Label>{dateLabel}</Form.Label>
        <Form.Control
          type="date"
          name={dateFieldName}
          value={formData.date}
          onChange={onFieldChange}
          isInvalid={!!errors.date}
        />
        <Form.Control.Feedback type="invalid">
          {errors.date}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Notes */}
      <Form.Group className="mb-3">
        <Form.Label>Notes</Form.Label>
        <Form.Control
          as="textarea"
          name="notes"
          value={formData.notes}
          onChange={onFieldChange}
          rows={3}
          placeholder="Enter notes"
        />
      </Form.Group>
    </>
  );
}

export default ExpenseFormCoreFields;