import { create } from 'zustand';

interface ExpenseStoreState {
  categories: any[];
  paymentMethods: any[];
  transactions: any[];
  recurringExpenses: any[];
  categoriesUsed: Set<number>;
  selectedTransaction: any | null;
  selectedRecurringExpense: any | null;
  selectedRecurringExpenseRelatedTransactions: any | null;

  setCategories: (categories: any[]) => void;
  setPaymentMethods: (paymentMethods: any[]) => void;
  setTransactions: (transactions: any[]) => void;
  setRecurringExpenses: (recurringExpenses: any[]) => void;
  setCategoriesUsed: (categoriesUsed: Set<number>) => void;
  setSelectedTransaction: (selectedTransaction: any | null) => void;
  setSelectedRecurringExpense: (selectedRecurringExpense: any | null) => void;
  setSelectedRecurringExpenseRelatedTransactions: (selectedRecurringExpenseRelatedTransactions: any | null) => void;
}

const useExpenseStore = create<ExpenseStoreState>((set) => ({
  categories: [],
  paymentMethods: [],
  transactions: [],
  recurringExpenses: [],
  categoriesUsed: new Set<number>(),
  selectedTransaction: null,
  selectedRecurringExpense: null,
  selectedRecurringExpenseRelatedTransactions: null,

  setCategories: (categories: any[]) => set({ categories }),
  setPaymentMethods: (paymentMethods: any[]) => set({ paymentMethods }),
  setTransactions: (transactions: any[]) => set({ transactions }),
  setRecurringExpenses: (recurringExpenses: any[]) => set({ recurringExpenses }),
  setCategoriesUsed: (categoriesUsed: Set<number>) => set({ categoriesUsed }),
  setSelectedTransaction: (selectedTransaction: any | null) =>
    set({ selectedTransaction }),
  setSelectedRecurringExpense: (selectedRecurringExpense: any | null) =>
    set({ selectedRecurringExpense }),
  setSelectedRecurringExpenseRelatedTransactions: (selectedRecurringExpenseRelatedTransactions: any | null) =>
    set({ selectedRecurringExpenseRelatedTransactions }),
}));

export default useExpenseStore;
