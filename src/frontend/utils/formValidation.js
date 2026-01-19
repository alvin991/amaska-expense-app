// Validate transaction form data (TransactionForm)
export function validateTransactionForm(formData) {
  const errors = {};

  // Amount
  if (!formData.amount && Number.isNaN(formData.amount)) {
    errors.amount = 'Amount is required.';
  }

  // Merchant (required; relax if you want)
  if (!formData.merchant || formData.merchant.trim() === '') {
    errors.merchant = 'Merchant is required.';
  }

  // Payment method
  if (!formData.payment_method_id) {
    errors.payment_method_id = 'Payment method is required.';
  }

  // Category
  if (!formData.category_id) {
    errors.category_id = 'Category is required.';
  }

  // Date
  if (!formData.transaction_date) {
    errors.transaction_date = 'Date is required.';
  } else if (Number.isNaN(Date.parse(formData.transaction_date))) {
    errors.transaction_date = 'Date is invalid.';
  }

  return errors;
}

// Validate category form data (CategoryDetailsPage)
export function validateCategoryForm(formData) {
  const errors = {};

  // Name
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Name is required.';
  } else if (formData.name.length > 50) {
    errors.name = 'Name must be 50 characters or fewer.';
  }

  // Notes (optional, example length cap)
  if (formData.notes && formData.notes.length > 200) {
    errors.notes = 'Notes must be 200 characters or fewer.';
  }

  // Color
  if (!formData.color) {
    errors.color = 'Color is required.';
  } else if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(formData.color)) {
    errors.color = 'Color must be a valid hex (e.g. #2196f3).';
  }

  // Icon
  if (!formData.icon) {
    errors.icon = 'Icon is required.';
  }

  return errors;
}