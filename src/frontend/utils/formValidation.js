////javascript
// filepath: c:\alvin\code\react\amaska-expense-app\src\frontend\utils\formValidation.js

// Validate transaction form data (TransactionEntryPage)
export function validateTransactionForm(formData) {
  const errors = {};

  // Amount
  if (!formData.amount || formData.amount.trim() === '') {
    errors.amount = 'Amount is required.';
  } else {
    const num = Number(formData.amount);
    if (Number.isNaN(num) || num <= 0) {
      errors.amount = 'Amount must be a number greater than 0.';
    }
  }

  // Merchant (required; relax if you want)
  if (!formData.merchant || formData.merchant.trim() === '') {
    errors.merchant = 'Merchant is required.';
  }

  // Payment method
  if (!formData.paymentMethod) {
    errors.paymentMethod = 'Payment method is required.';
  }

  // Category
  if (!formData.category) {
    errors.category = 'Category is required.';
  }

  // Date
  if (!formData.date) {
    errors.date = 'Date is required.';
  } else if (Number.isNaN(Date.parse(formData.date))) {
    errors.date = 'Date is invalid.';
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