import { validateTransactionForm } from '../utils/formValidation';
import { saveTransaction } from '../services/transactionService';

/**
 * Hook to handle transaction form submission logic:
 * - Validates form data
 * - Saves transaction
 * - Refreshes transaction list
 * - Closes modal
 */
export default function useTransactionSubmit({
  transaction,
  formData,
  setErrors,
  refreshTransactions,
  onHide,
}) {
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
        transaction_date: formData.transaction_date,
        merchant: formData.merchant,
        category_id: formData.category_id,
        payment_method_id: formData.payment_method_id,
      };

      await saveTransaction(tx);
      await refreshTransactions();
      onHide();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  return { handleSubmit };
}
