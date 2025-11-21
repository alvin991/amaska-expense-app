import { useState, useEffect } from 'react';
import { Form, Container, Button, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import ConfirmationModal from './MyConfirmBox';

function MyForm({ transaction, setTransaction, paymentMethods = [], categories = [], onHide, onSuccess, onNavigate }) {
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    paymentMethod: '',
    category: '',
    date: '',
    notes: ''
  });

  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Update form when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount || '',
        merchant: transaction.merchant || '',
        paymentMethod: transaction.payment_method_id || '',
        category: transaction.category_id || '',
        date: transaction.transaction_date?.split('T')[0] || '', // Format date for input
        notes: transaction.notes || ''
      });
    } else {
      // Reset form when no transaction
      setFormData({
        amount: '',
        merchant: '',
        paymentMethod: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAmountChange = (e) => {
    // Allow digits and single decimal point while typing
    let v = e.target.value.replace(/[^0-9.]/g, '');
    const parts = v.split('.');
    if (parts.length > 2) {
      // Keep only first decimal point and first fractional part
      v = parts[0] + '.' + parts.slice(1).join('');
      // Trim to max two fractional digits during input? keep flexible; we'll format on blur.
    }
    setFormData(prev => ({
      ...prev,
      amount: v
    }));
  };

  const handleAmountFocus = () => setIsAmountFocused(true);

  const handleAmountBlur = () => {
    setIsAmountFocused(false);
    const v = formData.amount;
    if (v === '' || v === null) return;
    const num = Number(v);
    if (Number.isNaN(num)) {
      setFormData(prev => ({ ...prev, amount: '' }));
      return;
    }
    // Format to exactly 2 decimal places on blur
    setFormData(prev => ({ ...prev, amount: num.toFixed(2) }));
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
        payment_method_id: parseInt(formData.paymentMethod) || null
      };

      if (transaction?.transaction_id) {
        await axios.put(`/api/transactions/${transaction.transaction_id}`, payload);
      } else {
        await axios.post('/api/transactions', payload);
      }

      await onSuccess(); // Refresh data first
      onHide();         // Then close modal
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleDelete = async () => {
    if (!transaction?.transaction_id) return;
    
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/transactions/${transaction.transaction_id}`);
      setShowConfirmModal(false);
      await onSuccess();
      onHide();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false); // Hide the modal
  };

  const formatAmount = (value) => {
    if (!value) return '';
    return `$${Number(value).toFixed(2)}`;
  };

  const handleSelectClick = (e) => {
    // console.log(`Select clicked`);
    e.preventDefault();
    onNavigate('categoryList');
    // setIsModalOpen(true);
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
              // show raw value while editing, otherwise show formatted 2-decimal value
              value={isAmountFocused ? formData.amount : (formData.amount !== '' ? Number(formData.amount).toFixed(2) : '')}
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
            onChange={handleChange}
          >
            <option value="">Select payment method</option>
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group> */}

        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select
            name="category"
            value={formData.category}
            onMouseDown={handleSelectClick}
            onChange={(e) => e.preventDefault()}
          >
            {/* <option value={formData.category}>{formData.category}</option> */}
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>


        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            name="date"
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
          <Button variant="primary" type="submit">
            {transaction ? 'Update' : 'Create'} Transaction
          </Button>
        </div>

        <div className="d-grid gap-2">
          <Button variant="danger" type="button" style={{ display: transaction ? 'block' : 'none' }} onClick={handleDelete}>
            Delete Transaction
          </Button>
        </div>
      </Form>

      <ConfirmationModal
        show={showConfirmModal}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Container>
  );
}

export default MyForm;