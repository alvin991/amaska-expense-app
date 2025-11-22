import { useState, useEffect, useRef } from 'react';
// import Modal from 'react-bootstrap/Modal';
import ModalStateManager from '../services/ModalStateManager';
// import pageRegistry from './PageRegistry';
import { PAGE_TYPES } from '../types/PageConfig';
import TransactionEntryPage, { DEFAULT_TRANSACTION } from './TransactionEntryPage';
import CategoryListPage from './CategoryListPage';
import CategoryDetailsPage, { DEFAULT_CATEGORY } from './CategoryDetailsPage'; // <-- import DEFAULT_CATEGORY

const ModalBase = ({
  paymentMethods = [],
  categories = [],
  propTransaction = DEFAULT_TRANSACTION,
  categoriesUsed = [],
  isOpen = false,
  refreshTransactions,
  refreshCategories,
  refreshPaymentMethods,
  onHide
}) => {
  const effectiveTransaction = propTransaction ?? DEFAULT_TRANSACTION;

  const [currentPage, setCurrentPage] = useState('transaction');
  const [stateManager] = useState(() => new ModalStateManager(PAGE_TYPES.TRANSACTION, propTransaction));
  const [state, setState] = useState(stateManager.getState());
  const [transaction, setTransaction] = useState(effectiveTransaction);
  const [propCategory, setPropCategory] = useState(DEFAULT_CATEGORY); // <-- add this line

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
  }, [isOpen]);

  // - update transaction
  const updateCategoryId = (CategoryId) => {
    // const newTransaction = JSON.parse(JSON.stringify(prev));
    // newTransaction['category_id'] = updates;
    // newTransaction['category_name'] = categories.find(cat => cat.id === updates).name;
    // setTransaction(newTransaction);
    console.log(`prev transaction: ${JSON.stringify(transaction, null, 2)}`);
    setTransaction(prev => ({ ...prev, category_id: CategoryId, category_name: categories.find(cat => cat.id === CategoryId).name }));
    console.log(`Updated transaction: ${JSON.stringify(transaction, null, 2)}`);
  };

  // Enhanced navigation handler
  const handleNavigate = (page, categoryObj = null) => {
    setCurrentPage(page);
    if (page === 'categoryDetails') {
      if (categoryObj) {
        setPropCategory(categoryObj);
      } else {
        setPropCategory(DEFAULT_CATEGORY);
      }
    }
  };

  const renderPageContent = () => {
    console.log(`Current page: ${currentPage}`);
    switch (currentPage) {
    case 'transaction':
        return <TransactionEntryPage 
                paymentMethods={paymentMethods}
                categories={categories}
                transaction={transaction}
                onNavigate={handleNavigate}
                refreshTransactions={refreshTransactions}
                onHide={onHide}
                setTransaction={setTransaction}
              />;
    case 'categoryList':
        return <CategoryListPage 
                categories={categories}
                categoriesUsed={categoriesUsed}
                transaction={transaction}
                updateCategoryId={updateCategoryId}
                onNavigate={handleNavigate}
                setTransaction={setTransaction}
              />;
    case 'categoryDetails':
        console.log(`redirecting to category details page`);
        return <CategoryDetailsPage 
                propCategory={propCategory}
                onNavigate={handleNavigate}
                refreshCategories={refreshCategories}
              />;
    default:
        return null;
    }
  };

  return (
    <div>
      {renderPageContent()}
    </div>
    // <Modal
    //   show={isOpen}
    //   onHide={onClose}
    //   dialogClassName="modal-90w"
    //   size='lg'
    //   centered
    //   backdrop="static"
    //   keyboard={false}
    // >
    //   <Modal.Header closeButton>
    //     <Modal.Title>{modalTitle}</Modal.Title>
    //   </Modal.Header>
    //   <Modal.Body>
    //     {renderPageContent()}
    //   </Modal.Body>
    // </Modal>
  );
};

export default ModalBase;