import { renderHook, act } from '@testing-library/react';
import useTransactionForm from './useTransactionForm';

describe('useTransactionForm', () => {
  // Test 1: Initial state is correct
  test('initializes form with empty values when no transaction provided', () => {
    const { result } = renderHook(() => useTransactionForm({}, null));

    expect(result.current.formData.amount).toBe('');
    expect(result.current.formData.merchant).toBe('');
    expect(result.current.errors).toEqual({});
  });

  // Test 2: Loads transaction data correctly
  test('loads existing transaction data', () => {
    const transaction = {
      transaction_id: 1,
      amount: 25.50,
      merchant: 'Starbucks',
      payment_method_id: 2,
      category_id: 3,
      transaction_date: '2026-01-07',
      notes: 'Coffee'
    };

    const { result } = renderHook(() => useTransactionForm(transaction, null));

    expect(result.current.formData.amount).toBe('25.50');
    expect(result.current.formData.merchant).toBe('Starbucks');
    expect(result.current.formData.paymentMethod).toBe(2);
    expect(result.current.formData.category).toBe(3);
    expect(result.current.formData.notes).toBe('Coffee');
  });

  // Test 3: handleChange updates form data
  test('handleChange updates the correct field', () => {
    const { result } = renderHook(() => useTransactionForm({}, null));

    act(() => {
      result.current.handleChange({
        target: { name: 'merchant', value: 'Target' }
      });
    });

    expect(result.current.formData.merchant).toBe('Target');
  });

  // Test 4: Form resets when transaction ID changes
  test('resets form when transaction changes', () => {
    const transaction1 = {
      transaction_id: 1,
      merchant: 'Starbucks'
    };

    const { result, rerender } = renderHook(
      ({ transaction }) => useTransactionForm(transaction, null),
      { initialProps: { transaction: transaction1 } }
    );

    expect(result.current.formData.merchant).toBe('Starbucks');

    // Change to different transaction
    const transaction2 = {
      transaction_id: 2,
      merchant: 'Target'
    };

    rerender({ transaction: transaction2 });

    expect(result.current.formData.merchant).toBe('Target');
  });
});
