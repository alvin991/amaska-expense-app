import React from 'react';
import { Form, Container, Button, InputGroup } from 'react-bootstrap';
import './TransactionForm.css';
import CategoryPickerField from './CategoryPickerField';
import useCategoryListPicker from '../hooks/useCategoryListPicker';
import useTransactionForm from '../hooks/useTransactionForm';
import useTransactionFormNew from '../hooks/useTransactionFormNew';
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
  formDataDraft,
  setFormDataDraft,
}) {

  // const {
  //   formData,
  //   setFormData,
  //   errors,
  //   setErrors,
  //   amountInputRef,
  //   amountInputHandlers,
  //   handleChange,
  //   handlePaymentMethodChange,
  //   isDirty,
  //   isSystemGenerated
  // } = useTransactionForm(transaction, onDirtyChange);
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    amountInputRef,
    amountInputHandlers,
    handleChange,
    isDirty,
    isSystemGenerated,
    openCategoryList
  } = useTransactionFormNew(transaction, onDirtyChange, navigation, currentParams, formDataDraft, setFormDataDraft);

  // const { openCategoryList } = useCategoryListPicker({
  //   ...navigation,
  //   // Wrap openCategoryList to save draft before navigating
  //   navigate: (...args) => {
  //     if (setFormDataDraft) {
  //       setFormDataDraft(formData);
  //     }
  //     navigation.navigate(...args);
  //   }
  // });

  // On mount or when coming back from CategoryListPage, restore formData from draft if available
  // React.useEffect(() => {
  //   if (formDataDraft) {
  //     setFormData(formDataDraft);
  //   }
  // }, [formDataDraft]);

  // Watch for selectedCategoryId from navigation params (when coming back from CategoryListPage)
  // React.useEffect(() => {
  //   const selectedCategoryId = currentParams?.selectedCategoryId;
  //   if (selectedCategoryId) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       // category: selectedCategoryId,
  //       category_id: selectedCategoryId
  //     }));
  //   }
  // }, [currentParams?.selectedCategoryId]);

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
          <Form.Label>Amount {isDirty ? 'is dirty' : 'is clean'}</Form.Label>
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
            {/* Planned Amount and Projected Amount (only if system-generated) */}
            {isSystemGenerated && (
              <>
                <InputGroup.Text style={{ background: '#f0f0f0', color: '#555', borderLeft: 'none', borderRight: 'none' }}>
                  Planned Amount
                </InputGroup.Text>
                <InputGroup.Text style={{ background: '#f0f0f0', color: '#555', minWidth: 90, justifyContent: 'end' }}>
                  ${transaction.projected_amount !== undefined && transaction.projected_amount !== null ? Number(transaction.projected_amount).toFixed(2) : '--'}
                </InputGroup.Text>
              </>
            )}
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
            disabled={isSystemGenerated}
            style={isSystemGenerated ? { background: '#e9ecef', color: '#6c757d' } : {}}
          />
          <Form.Control.Feedback type="invalid">
            {errors.merchant}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Payment Method */}
        <Form.Group className="mb-3">
          <Form.Label>Payment Method</Form.Label>
          <Form.Select
            name="payment_method_id"
            value={formData.payment_method_id != null ? String(formData.payment_method_id) : ""}
            onChange={handleChange}
            isInvalid={!!errors.paymentMethod}
            disabled={isSystemGenerated}
            style={isSystemGenerated ? { background: '#e9ecef', color: '#6c757d' } : {}}
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
          selectedCategoryId={formData.category_id != null ? formData.category_id : null}
          error={errors.category}
          onClick={isSystemGenerated ? undefined : openCategoryList}
          disabled={isSystemGenerated}
          style={isSystemGenerated ? { background: '#e9ecef', color: '#6c757d' } : {}}
        />

        {/* Date */}
        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          {isSystemGenerated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Form.Control
                type="date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleChange}
                isInvalid={!!errors.transaction_date}
                style={{ width: '50%' }}
              />
              <div style={{ width: '50%' }}>
                {transaction.projected_transaction_date && (
                  <div style={{ background: '#f0f0f0', color: '#555', padding: '0.375rem 0.75rem', borderRadius: 4, fontSize: '0.95em', width: '100%' }}>
                    Planned Date: {transaction.projected_transaction_date}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Form.Control
              type="date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleChange}
              isInvalid={!!errors.transaction_date}
            />
          )}
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