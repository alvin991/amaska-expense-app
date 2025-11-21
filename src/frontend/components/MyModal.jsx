import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import ModalStateManager from '../services/ModalStateManager';
import pageRegistry from './PageRegistry';
import { PAGE_TYPES } from '../types/PageConfig';

const MyModal = ({ 
      isOpen, 
      title, 
      onClose, 
      onSuccess, 
      transaction: initialTransaction,
      paymentMethods, 
      categories,
      categoriesUsed 
    }) => {
  const [stateManager] = useState(
    () => new ModalStateManager(PAGE_TYPES.TRANSACTION, initialTransaction)
  );
  const [state, setState] = useState(stateManager.getState());

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = stateManager.subscribe(setState);
    return unsubscribe;
  }, [stateManager]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      stateManager.reset(PAGE_TYPES.TRANSACTION, initialTransaction);
    }
  }, [isOpen, initialTransaction, stateManager]);

  if (!isOpen) return null;

  const renderPageContent = () => {
    const pageConfig = pageRegistry.getPage(state.currentPage);
    
    if (!pageConfig) {
      return <div>Page not found</div>;
    }

    const PageComponent = pageConfig.component;

    // Common props for all pages
    const commonProps = {
      transaction: state.transaction,
      setTransaction: (trans) => stateManager.setTransaction(trans),
      onNavigate: (page) => stateManager.navigateTo(page),
      onClose,
      onSuccess,
    };

    // Page-specific props
    const pageProps = {
      [PAGE_TYPES.TRANSACTION]: {
        paymentMethods,
        categories,
      },
      [PAGE_TYPES.CATEGORY_LIST]: {
        categories,
        categoriesUsed,
        onSelectCategory: (categoryId) => {
          stateManager.updateCategory(categoryId);
          stateManager.navigateTo(PAGE_TYPES.TRANSACTION);
        },
      },
      [PAGE_TYPES.CATEGORY_DETAILS]: {
        // Category details props
      },
    };

    return (
      <PageComponent 
        {...commonProps}
        {...pageProps[state.currentPage]}
      />
    );
  };

  const currentPageConfig = pageRegistry.getPage(state.currentPage);
  const modalTitle = title || currentPageConfig?.title || 'Modal';

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      dialogClassName="modal-90w"
      size='lg'
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {renderPageContent()}
      </Modal.Body>
    </Modal>
  );
};

export default MyModal;