import { useState, useEffect, useMemo } from 'react';
import { Form, Container, Button, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import ConfirmationModal from './MyConfirmBox';

export const DEFAULT_TRANSACTION = {
  transaction_id: null,
  amount: 0.0,
  merchant: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
  category_id: '',
  category_name: '',
  payment_method_id: '',
  payment_method_name: ''
};

function TransactionEntryPage({
  transaction = {},          // draft
  paymentMethods = [],
  categories = [],
  navigation,
  refreshTransactions,
  onHide,
  onChangeDraft,             // updater from ModalBase
  isDirty,                   // computed in ModalBase
}) {
  // local UI state
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    paymentMethod: '',
    category: '',
    date: '',
    notes: ''
  });

  const [isAmountFocused, setIsAmountFocused] = useState(false);
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
  }, [transaction?.transaction_id]);

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
    try {
      const payload = {
        user_id: 1,
        amount: parseFloat(formData.amount) || 0,
        notes: formData.notes,
        transaction_date: formData.date,
        merchant: formData.merchant,
        category_id: parseInt(formData.category) || null,
        payment_method_id: parseInt(formData.paymentMethod) || null,
      };

      if (transaction?.transaction_id) {
        await axios.put(`/api/transactions/${transaction.transaction_id}`, payload);
      } else {
        await axios.post('/api/transactions', payload);
      }

      await refreshTransactions();
      onHide();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleDelete = () => {
    if (!transaction?.transaction_id) return;
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/transactions/${transaction.transaction_id}`);
      setShowConfirmModal(false);
      await refreshTransactions();
      onDirtyChange?.(false);
      onHide();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
  };



  // optional: page-level Cancel button (uses navigation.back -> ModalBase confirm)
  const handleCancel = () => {
    navigation.back();
  };

  return (
    <Container className="mt-3">
      <Form onSubmit={handleSubmit}>
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
            />
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Merchant</Form.Label>
          <Form.Control
            type="text"
            name="merchant"
            value={formData.merchant}
            onChange={handleChange}
            placeholder="Enter merchant name"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Payment Method</Form.Label>
          <Form.Select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handlePaymentMethodChange}
          >
            <option value="">Select payment method</option>
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select
            name="category"
            value={formData.category}          // <-- use formData
            onMouseDown={handleSelectClick}
            onChange={(e) => e.preventDefault()}
          >
            {formData.category === '' && <option value="">Select Category</option>}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            name="transaction_date"
            value={formData.date}
            onChange={handleChange}
          />
        </Form.Group>

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
            disabled={!isDirty}   // uses ModalBase’s comparison result
          >
            {transaction.transaction_id ? 'Update' : 'Create'}
          </Button>
        </div>

        <div className="d-grid gap-2">
          <Button
            variant="danger"
            type="button"
            style={{ display: transaction.transaction_id ? 'block' : 'none' }}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </Form>

      {/* <ConfirmationModal
        show={showConfirmModal}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      /> */}
    </Container>
  );
}

export default TransactionEntryPage;