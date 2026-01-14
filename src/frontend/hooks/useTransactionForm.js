import { useEffect, useState, useMemo } from 'react';
import useNumericInput from './useNumericInput';
import { all } from 'axios';

/**
 * Encapsulates TransactionForm form state and field-level handlers,
 * so the page component can focus on layout and submit flow.
 */
export default function useTransactionForm(transaction, onDirtyChange) {
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    paymentMethod: '',
    category: '',
    transaction_date: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  
  // Store the original values to compare against for isDirty
  const [originalData, setOriginalData] = useState(null);

  // Initialize/refresh form when transaction changes
  useEffect(() => {
    const amountNumber =
      typeof transaction.amount === 'number'
        ? transaction.amount
        : Number(transaction.amount);

    const initialFormData = {
      amount:
        !Number.isNaN(amountNumber) && amountNumber !== undefined && amountNumber !== null
          ? amountNumber.toFixed(2)
          : '',
      merchant: transaction.merchant ?? '',
      paymentMethod: transaction.payment_method_id ?? '',
      category: transaction.category_id ?? '',
      transaction_date:
        transaction.transaction_date?.split('T')[0] ||
        new Date().toISOString().split('T')[0],
      notes: transaction.notes ?? '',
    };

    setFormData(initialFormData);
    setErrors({});
    
    // Store the original values for isDirty comparison
    setOriginalData(initialFormData);
  }, [transaction.transaction_id]);

  // Compute isDirty by comparing current state with original state
  const isDirty = useMemo(() => {
    if (!originalData) return false; // Not yet initialized
    
    const currentAmount = Number(formData.amount) || 0;
    const originalAmount = Number(originalData.amount) || 0;

    return (
      currentAmount !== originalAmount ||
      formData.merchant !== originalData.merchant ||
      formData.paymentMethod !== originalData.paymentMethod ||
      formData.category !== originalData.category ||
      formData.transaction_date !== originalData.transaction_date ||
      formData.notes !== originalData.notes
    );
  }, [formData, originalData]);

  // Notify parent when isDirty changes
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const {
    inputRef: amountInputRef,
    inputProps: amountInputHandlers
  } = useNumericInput({
    value: formData.amount,
    setValue: (v) => setFormData((prev) => ({ ...prev, amount: v })),
    format: { precision: 2, allowNegative: true },
    error: {
      setError: setErrors,
      key: 'amount',
      message: 'Amount must be numeric.',
    },
  });

  const handlePaymentMethodChange = (e) => {
    const newId = parseInt(e.target.value, 10) || '';
    setFormData((prev) => ({ ...prev, paymentMethod: newId }));
  };

  // Auto-focus on amount field when component mounts
  useEffect(() => {
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, []);

  // Computed: lock fields if transaction is system-generated (from recurring_template)
  // If transaction_id is missing, it's a new transaction (not system-generated)
  const isSystemGenerated = useMemo(() => {
    if (!transaction || !transaction.transaction_id) return false;
    return transaction.recurring_template_id !== null && transaction.recurring_template_id !== undefined;
  }, [transaction?.transaction_id, transaction?.recurring_template_id]);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    amountInputRef,
    amountInputHandlers,
    handleChange,
    handlePaymentMethodChange,
    isDirty,
    isSystemGenerated, // Add this flag for consumers to lock fields
  };
}
