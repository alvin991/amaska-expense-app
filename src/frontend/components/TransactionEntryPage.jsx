import { useState, useEffect } from 'react';
import { Form, Container, Button, InputGroup } from 'react-bootstrap';
import { saveTransaction } from '../services/transactionService';
import { validateTransactionForm } from '../utils/formValidation';

function TransactionEntryPage({
  transaction = {},
  paymentMethods = [],
  categories = [],
  navigation,
  refreshTransactions,
  onHide,
  onChangeDraft,
  isDirty,
  onDelete,
}) {
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    paymentMethod: '',
    category: '',
    date: '',
    notes: ''
  });

  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [errors, setErrors] = useState({});   // NEW

  useEffect(() => {
    setFormData({
      amount: transaction.amount ?? '',
      merchant: transaction.merchant ?? '',
      paymentMethod: transaction.payment_method_id ?? '',
      category: transaction.category_id ?? '',
      date:
        transaction.transaction_date?.split('T')[0] ||
        transaction.date ||
        new Date().toISOString().split('T')[0],
      notes: transaction.notes ?? '',
    });
    setErrors({});
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const key = name === 'transaction_date' ? 'date' : name;

    setFormData(prev => ({ ...prev, [key]: value }));

    onChangeDraft?.(prev => ({
      ...prev,
      merchant: key === 'merchant' ? value : prev.merchant,
      notes:    key === 'notes'    ? value : prev.notes,
      transaction_date:
        key === 'date' ? value : (prev.transaction_date || prev.date),
    }));
  };

  const handleAmountChange = (e) => {
    let v = e.target.value.replace(/[^0-9.]/g, '');
    const parts = v.split('.');
    if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('');
    setFormData(prev => ({ ...prev, amount: v }));
    onChangeDraft?.(prev => ({ ...prev, amount: v }));
  };

  const handleAmountFocus = () => setIsAmountFocused(true);

  const handleAmountBlur = () => {
    setIsAmountFocused(false);
    const v = formData.amount;
    if (v === '' || v === null) return;
    const num = Number(v);
    if (Number.isNaN(num)) {
      setFormData(prev => ({ ...prev, amount: '' }));
      onChangeDraft?.(prev => ({ ...prev, amount: '' }));
      setErrors(prev => ({ ...prev, amount: 'Amount must be numeric.' }));
      return;
    }
    const formatted = num.toFixed(2);
    setFormData(prev => ({ ...prev, amount: formatted }));
    onChangeDraft?.(prev => ({ ...prev, amount: formatted }));
  };

  const handlePaymentMethodChange = (e) => {
    const newId = parseInt(e.target.value) || '';
    setFormData(prev => ({ ...prev, paymentMethod: newId }));
    onChangeDraft?.(prev => ({ ...prev, payment_method_id: newId || null }));
  };

  const handleSelectClick = (e) => {
    e.preventDefault();
    navigation.navigate('categoryList', {
      onCategorySelected: (categoryId) => {
        setFormData(prev => ({ ...prev, category: categoryId }));
        onChangeDraft?.(prev => ({ ...prev, category_id: categoryId || null }));
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateTransactionForm(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const tx = {
        ...transaction,
        amount: formData.amount,
        notes: formData.notes,
        transaction_date: formData.date,
        merchant: formData.merchant,
        category_id: formData.category,
        payment_method_id: formData.paymentMethod,
      };

      await saveTransaction(tx);
      await refreshTransactions();
      onHide();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  return (
    <Container className="mt-3">
      <Form onSubmit={handleSubmit}>
        {/* Amount */}
        <Form.Group className="mb-3">
          <Form.Label>Amount</Form.Label>
          <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control
              type="text"
              name="amount"
              value={
                isAmountFocused
                  ? formData.amount
                  : (formData.amount !== '' ? Number(formData.amount).toFixed(2) : '')
              }
              onChange={handleAmountChange}
              onFocus={handleAmountFocus}
              onBlur={handleAmountBlur}
              placeholder="0.00"
              style={{ textAlign: 'left' }}
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

        {/* Category */}
        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select
            name="category"
            value={formData.category}
            onMouseDown={handleSelectClick}
            onChange={(e) => e.preventDefault()}
            isInvalid={!!errors.category}
          >
            {formData.category === '' && <option value="">Select Category</option>}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.category}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Date */}
        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            name="transaction_date"
            value={formData.date}
            onChange={handleChange}
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

export default TransactionEntryPage;