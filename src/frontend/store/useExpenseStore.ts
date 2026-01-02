import { create } from 'zustand';

interface ExpenseStoreState {
  categories: any[];
  paymentMethods: any[];
  transactions: any[];
  recurringTemplates: any[];
  categoriesUsed: Set<number>;
  selectedTransaction: any | null;
  selectedRecurringTemplate: any | null;
  selectedRecurringTemplateRelatedTransactions: any | null;

  setCategories: (categories: any[]) => void;
  setPaymentMethods: (paymentMethods: any[]) => void;
  setTransactions: (transactions: any[]) => void;
  setRecurringTemplates: (recurringTemplates: any[]) => void;
  setCategoriesUsed: (categoriesUsed: Set<number>) => void;
  setSelectedTransaction: (selectedTransaction: any | null) => void;
  setSelectedRecurringTemplate: (selectedRecurringTemplate: any | null) => void;
  setSelectedRecurringTemplateRelatedTransactions: (selectedRecurringTemplateRelatedTransactions: any | null) => void;
}

const useExpenseStore = create<ExpenseStoreState>((set) => ({
  categories: [],
  paymentMethods: [],
  transactions: [],
  recurringTemplates: [],
  categoriesUsed: new Set<number>(),
  selectedTransaction: null,
  selectedRecurringTemplate: null,
  selectedRecurringTemplateRelatedTransactions: null,

  setCategories: (categories: any[]) => set({ categories }),
  setPaymentMethods: (paymentMethods: any[]) => set({ paymentMethods }),
  setTransactions: (transactions: any[]) => set({ transactions }),
  setRecurringTemplates: (recurringTemplates: any[]) => set({ recurringTemplates }),
  setCategoriesUsed: (categoriesUsed: Set<number>) => set({ categoriesUsed }),
  setSelectedTransaction: (selectedTransaction: any | null) =>
    set({ selectedTransaction }),
  setSelectedRecurringTemplate: (selectedRecurringTemplate: any | null) =>
    set({ selectedRecurringTemplate }),
  setSelectedRecurringTemplateRelatedTransactions: (selectedRecurringTemplateRelatedTransactions: any | null) =>
    set({ selectedRecurringTemplateRelatedTransactions }),
}));

export default useExpenseStore;
