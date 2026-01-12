import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransactionForm from './TransactionForm';
import * as transactionService from '../services/transactionService';

// Mock the service
jest.mock('../services/transactionService');

describe('TransactionForm', () => {
  const mockProps = {
    transaction: {},
    paymentMethods: [
      { id: 1, name: 'Credit Card' },
      { id: 2, name: 'Cash' }
    ],
    categories: [
      { id: 1, name: 'Food' },
      { id: 2, name: 'Transport' }
    ],
    navigation: { navigate: jest.fn() },
    refreshTransactions: jest.fn(),
    onHide: jest.fn(),
    onDelete: jest.fn(),
  };

  // Test 1: Component renders
  test('renders all form fields', () => {
    render(<TransactionForm {...mockProps} />);

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/merchant/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/payment method/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  // Test 2: User can type in fields
  test('allows user to type in merchant field', () => {
    render(<TransactionForm {...mockProps} />);

    const merchantInput = screen.getByLabelText(/merchant/i);
    fireEvent.change(merchantInput, { target: { value: 'Starbucks' } });

    expect(merchantInput.value).toBe('Starbucks');
  });

  // Test 3: Shows validation errors
  test('shows error when submitting empty form', async () => {
    render(<TransactionForm {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
      expect(screen.getByText(/merchant is required/i)).toBeInTheDocument();
    });
  });

  // Test 4: Successful submission
  test('submits form with valid data', async () => {
    transactionService.saveTransaction.mockResolvedValue({ id: 1 });

    render(<TransactionForm {...mockProps} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '25.50' } });
    fireEvent.change(screen.getByLabelText(/merchant/i), { target: { value: 'Starbucks' } });
    
    // Select payment method
    const paymentSelect = screen.getByLabelText(/payment method/i);
    fireEvent.change(paymentSelect, { target: { value: '1' } });

    // Submit
    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(transactionService.saveTransaction).toHaveBeenCalled();
      expect(mockProps.refreshTransactions).toHaveBeenCalled();
      expect(mockProps.onHide).toHaveBeenCalled();
    });
  });

  // Test 5: Shows Update button for existing transaction
  test('shows Update button when editing existing transaction', () => {
    const existingTransaction = {
      transaction_id: 1,
      amount: 25.50,
      merchant: 'Starbucks'
    };

    render(<TransactionForm {...mockProps} transaction={existingTransaction} />);

    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
  });
});
