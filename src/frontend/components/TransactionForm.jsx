import React from 'react';
import { Form, Container, Button, InputGroup } from 'react-bootstrap';
import './TransactionForm.css';
import CategoryPickerField from './CategoryPickerField';
import useCategoryListPicker from '../hooks/useCategoryListPicker';
import useTransactionForm from '../hooks/useTransactionForm';
import useTransactionSubmit from '../hooks/useTransactionSubmit';

function TransactionForm({
  transaction = {},
  paymentMethods = [],
  categories = [],
  navigation,
  currentParams,
  refreshTransactions,
  onHide,
  onDelete,
  onDirtyChange,
}) {

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    amountInputRef,
    amountInputHandlers,
    handleChange,
    handlePaymentMethodChange,
    isDirty,
  } = useTransactionForm(transaction, onDirtyChange);

  const { openCategoryList } = useCategoryListPicker(navigation);

  // Watch for selectedCategoryId from navigation params (when coming back from CategoryListPage)
  React.useEffect(() => {
    const selectedCategoryId = currentParams?.selectedCategoryId;
    if (selectedCategoryId) {
      // console.log('TransactionForm - Received selectedCategoryId from navigation:', selectedCategoryId);
      setFormData((prev) => ({
        ...prev,
        category: selectedCategoryId
      }));
    }
  }, [currentParams?.selectedCategoryId]);

  const { handleSubmit } = useTransactionSubmit({
    transaction,
    formData,
    setErrors,
    refreshTransactions,
    onHide,
  });

  return (
    <Container className="mt-3">
      <Form onSubmit={handleSubmit}>
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
              {...amountInputHandlers}
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
            onChange={handleChange}
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
            onChange={handlePaymentMethodChange}
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

        {/* Category (fake dropdown textbox with icon) */}
        <CategoryPickerField
          categories={categories}
          selectedCategoryId={formData.category}
          error={errors.category}
          onClick={openCategoryList}
        />

        {/* Date */}
        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            name="transaction_date"
            value={formData.transaction_date}
            onChange={handleChange}
            isInvalid={!!errors.transaction_date}
          />
          <Form.Control.Feedback type="invalid">
            {errors.transaction_date}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Notes */}
        <Form.Group className="mb-3">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Enter notes"
          />
        </Form.Group>

        <div className="d-grid gap-2 mb-3">
          <Button
            variant="primary"
            type="submit"
            disabled={!isDirty}
          >
            {transaction.transaction_id ? 'Update' : 'Create'}
          </Button>
        </div>

        <div className="d-grid gap-2">
          <Button
            variant="danger"
            type="button"
            style={{ display: transaction.transaction_id ? 'block' : 'none' }}
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default TransactionForm;