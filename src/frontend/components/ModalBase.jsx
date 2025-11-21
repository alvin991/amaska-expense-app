import { useState, useEffect } from 'react';
import ModalStateManager from '../services/ModalStateManager';
// import pageRegistry from './PageRegistry';
import { PAGE_TYPES } from '../types/PageConfig';
import TransactionEntryPage, { DEFAULT_TRANSACTION } from './TransactionEntryPage';
import CategoryListPage from './CategoryListPage';


const ModalBase = ( { paymentMethods = [], categories = [], propTransaction = DEFAULT_TRANSACTION, categoriesUsed = [], isOpen = false, refreshData, onHide } ) => {
  const effectiveTransaction = propTransaction ?? DEFAULT_TRANSACTION;

  const [currentPage, setCurrentPage] = useState('transaction');
  const [stateManager] = useState( () => new ModalStateManager(PAGE_TYPES.TRANSACTION, propTransaction) );
  const [state, setState] = useState(stateManager.getState());
  const [transaction, setTransaction] = useState(effectiveTransaction);
  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = stateManager.subscribe(setState);
    return unsubscribe;
  }, [stateManager]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      stateManager.reset(PAGE_TYPES.TRANSACTION, transaction);
    }
  }, [isOpen, transaction, stateManager]);

  // - update transaction
  const updateCategoryId = ( CategoryId ) => {
    // const newTransaction = JSON.parse(JSON.stringify(prev));
    // newTransaction['category_id'] = updates;
    // newTransaction['category_name'] = categories.find(cat => cat.value === updates).name;
    // setTransaction(newTransaction);
    console.log(`prev transaction: ${JSON.stringify(transaction, null, 2)}`);
    setTransaction(prev => ({ ...prev, category_id: CategoryId, category_name: categories.find(cat => cat.value === CategoryId).name }));
    console.log(`Updated transaction: ${JSON.stringify(transaction, null, 2)}`);
  };

  const renderPageContent = () => {
      switch (currentPage) {
      case 'transaction':
          return <TransactionEntryPage 
                  paymentMethods={paymentMethods}
                  categories={categories}
                  transaction={transaction}
                  onNavigate={setCurrentPage}
                  refreshData={refreshData}
                  onHide={onHide}
                  setTransaction={setTransaction}
                />;
      case 'categoryList':
          return <CategoryListPage 
                  categories={categories}
                  categoriesUsed={categoriesUsed}
                  transaction={transaction}
                  updateCategoryId={updateCategoryId}
                  onNavigate={setCurrentPage}
                  setTransaction={setTransaction}
                />;
      case 'categoryDetails':
          return <CategoryDetailsPage onNavigate={setCurrentPage} />;
      default:
          return null;
      }
  };

  return (
    <div>
      {renderPageContent()}
    </div>
  );
};

export default ModalBase;