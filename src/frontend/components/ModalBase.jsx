import { useState, useEffect } from 'react';
import TransactionForm from './TransactionForm';
import RecurringTemplateForm from './RecurringTemplateForm';
import RecurringTemplateRelatedTransactionsPage from './RecurringTemplateRelatedTransactionsPage';
import CategoryListPage from './CategoryListPage';
import CategoryDetailsPage from './CategoryDetailsPage';
import IconSelectPage from './IconSelectPage';
import ColorSelectPage from './ColorSelectPage';
import Modal from 'react-bootstrap/Modal';
import MyConfirmBox from "./MyConfirmBox";
import { useModalConfirm } from '../hooks/useModalConfirm';
import { deleteTransactionById } from '../services/transactionService';
import { deleteCategoryById } from '../services/categoryService';
import { DEFAULT_TRANSACTION, DEFAULT_RECURRING_TEMPLATE, DEFAULT_CATEGORY } from '../constants/defaults';
import useExpenseStore from '../store/useExpenseStore';

const ModalBase = ({
  // visibility / mode
  isOpen = false,
  rootPage = 'transaction',
  isRecurring,

  // refresh callbacks
  refreshTransactions,
  refreshCategories,
  refreshPaymentMethods,
  refreshRecurringTemplates,

  // lifecycle
  onHide,
}) => {
  const {
    categories,
    paymentMethods,
    categoriesUsed,
    selectedTransaction,
    selectedRecurringTemplate,
    selectedRecurringTemplateRelatedTransactions,
    transactions,
    setSelectedTransaction,
  } = useExpenseStore();

  const effectiveRootPage = isRecurring ? 'recurring' : rootPage;
  const effectiveTransaction = selectedTransaction ?? DEFAULT_TRANSACTION;
  // console.log(`effectiveTransaction:`, effectiveTransaction);
  const [propCategory, setPropCategory] = useState(DEFAULT_CATEGORY);
  const [isDirty, setIsDirty] = useState(false);
  const [navStack, setNavStack] = useState([{ page: effectiveRootPage, params: null }]);
  
  const currentEntry = navStack[navStack.length - 1];
  const currentPage = currentEntry?.page ?? rootPage;
  const currentParams = currentEntry?.params ?? null;
  const canGoBack = navStack.length > 1;

  useEffect(() => {
    setNavStack([{ page: isRecurring ? 'recurring' : rootPage, params: null }]);
  }, [rootPage, isRecurring]);

  // --- NAVIGATION API (CONTAINER RESPONSIBILITY) -----------------------------
  const navigate = (page, params = null) => {
    if (page === 'categoryDetails') {
      if (params?.category) {
        setPropCategory(params.category);
      } else {
        setPropCategory(DEFAULT_CATEGORY);
      }
    }

    setNavStack((prev) => [...prev, { page, params }]);
  };

  const back = () => {
    setNavStack((prev) => {
      if (prev.length <= 1) return prev; // already at root
      const next = prev.slice(0, -1);
      const top = next[next.length - 1];

      if (top?.page === 'categoryDetails' && top?.params?.category) {
        setPropCategory(top.params.category);
      }
      return next;
    });
  };

  const resetToRoot = () => {
    setNavStack([{ page: effectiveRootPage, params: null }]);
  };

  const navigation = {
    navigate,
    back,
    resetToRoot,
    currentPage,
    canGoBack,
  };

  // --- TITLE (optional, based on page) --------------------------------------
  const getTitle = () => {
    switch (currentPage) {
      case 'transaction':
        return 'Transaction';
      case 'recurring':
        return 'Recurring Template';
      case 'categoryList':
        return 'Select Category';
      case 'categoryDetails':
        return 'Category Details';
      case 'iconSelect':
        return 'Select Icon';
      case 'colorSelect':
        return 'Select Color';
      default:
        return '';
    }
  };

  const deleteTransaction = async () => {
    if (!effectiveTransaction?.transaction_id) return;
    await deleteTransactionById(effectiveTransaction.transaction_id);
    if (refreshTransactions) await refreshTransactions();
  };

  const deleteCategory = async () => {
    if (!propCategory?.id) return;
    await deleteCategoryById(propCategory.id);
    if (refreshCategories) await refreshCategories();
  };

  const actuallyHide = () => {
    setNavStack([{ page: effectiveRootPage, params: null }]);
    onHide();
  };

  // --- CONFIRM CONTROLLER HOOK ----------------------------------------------
  const confirm = useModalConfirm({
    deleteTransaction,
    deleteCategory,
    onHide: actuallyHide,
    navigationBack: back,
    clearDirty: () => setIsDirty(false),
  });

  // --- RENDER SWITCH ---------------------------------------------------------
  const renderPageContent = () => {
    switch (currentPage) {
      case 'transaction':
        // console.log('Rendering TransactionForm with:', effectiveTransaction);
        return (
          <TransactionForm
            transaction={effectiveTransaction}
            paymentMethods={paymentMethods}
            categories={categories}
            navigation={navigation}
            currentParams={currentParams}
            refreshTransactions={refreshTransactions}
            onHide={actuallyHide}
            onDelete={confirm.openDeleteTransaction}
            onDirtyChange={setIsDirty}
          />
        );

      case 'recurring': {
        const effectiveTemplate = selectedRecurringTemplate || DEFAULT_RECURRING_TEMPLATE;
        const relatedCount = selectedRecurringTemplateRelatedTransactions?.length ?? 0;

        return (
          <RecurringTemplateForm
            template={effectiveTemplate}
            paymentMethods={paymentMethods}
            categories={categories}
            navigation={navigation}
            currentParams={currentParams}
            onHide={actuallyHide}
            refreshRecurringTemplates={refreshRecurringTemplates}
            relatedCount={relatedCount}
            onViewRelated={() => {
              if (relatedCount === 0) return;
              navigation.navigate('recurringRelatedTransactions', { id: effectiveTemplate.id });
            }}
            onDirtyChange={setIsDirty}
          />
        );
      }

      case 'recurringRelatedTransactions': {
        const recurringId = currentParams?.id;
        return (
          <RecurringTemplateRelatedTransactionsPage
            recurringTemplateId={recurringId}
            transactions={selectedRecurringTemplateRelatedTransactions}
            navigation={navigation}
            onRowDoubleClick={(tx) => {
              if (!tx) return;
              const normalized = {
                ...tx,
                transaction_id: tx.transaction_id || tx.id,
              };
              setSelectedTransaction(normalized);
              navigation.navigate('transaction');
            }}
          />
        );
      }

      case 'categoryList': {
        // Determine which item to use based on whether we're in transaction or recurring mode
        const selectedItem = effectiveRootPage === 'recurring' 
          ? (selectedRecurringTemplate || DEFAULT_RECURRING_TEMPLATE)
          : effectiveTransaction;
        
        // Handle category selection by updating navigation params
        const handleCategorySelected = (categoryId) => {
          console.log('ModalBase - Category selected:', categoryId);
          // Navigate back to the form with selectedCategoryId in params
          setNavStack((prev) => {
            const newStack = prev.slice(0, -1); // Remove categoryList page
            const formPage = newStack[newStack.length - 1];
            // Update the form page params with selectedCategoryId
            newStack[newStack.length - 1] = {
              ...formPage,
              params: { ...formPage.params, selectedCategoryId: categoryId }
            };
            return newStack;
          });
        };
        
        return (
          <CategoryListPage
            categories={categories}
            categoriesUsed={categoriesUsed}
            selectedItem={selectedItem}
            navigation={navigation}
            onCategorySelected={handleCategorySelected}
          />
        );
      }

      case 'categoryDetails':
        return (
          <CategoryDetailsPage
            propCategory={propCategory}
            navigation={navigation}
            refreshCategories={refreshCategories}
            onDirtyChange={setIsDirty}
            onDelete={confirm.openDeleteCategory}   // << use hook
          />
        );

      case 'iconSelect':
        return (
          <IconSelectPage
            navigation={navigation}
            {...currentParams}
          />
        );

      case 'colorSelect':
        return (
          <ColorSelectPage
            navigation={navigation}
            {...currentParams}
          />
        );

      default:
        return null;
    }
  };

  // --- CLOSE/BACK USING CONFIRM CONTROLLER ----------------------------------
  const handleRequestClose = () => {
    if (isDirty) {
      confirm.openDiscardCancel();
    } else {
      actuallyHide();
    }
  };

  const handleRequestBack = () => {
    if (isDirty && currentPage !== 'categoryList') {
      confirm.openDiscardBack();
    } else {
      navigation.back();
    }
  };

  return (
    <>
      <Modal
        show={isOpen}
        onHide={handleRequestClose}
        dialogClassName="modal-90w"
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header
          className="d-flex align-items-center"
          style={{ position: 'relative' }}
        >
          {/* Left (Back) */}
          <div className="d-flex align-items-center" style={{ minWidth: 100 }}>
            {/* {currentPage !== rootPage && ( */}
            {canGoBack && (
              <button
                type="button"
                className="btn btn-secondary btn-ms"
                disabled={!navigation.canGoBack}
                onClick={handleRequestBack}
              >
                &larr; Back
              </button>
            )}
          </div>

          {/* Center (Title) */}
          <Modal.Title
            className="text-center"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
            }}
          >
            {getTitle()}
          </Modal.Title>

          {/* Right (Cancel) */}
          <div
            className="d-flex align-items-center justify-content-end ms-auto"
            style={{ minWidth: 100 }}
          >
            <button
              type="button"
              className="btn btn-secondary btn-ms"
              onClick={handleRequestClose}
            >
              Cancel
            </button>
          </div>
        </Modal.Header>

        <Modal.Body>
          {renderPageContent()}
        </Modal.Body>

        {/* You can add a common Delete footer here and use confirm.openDeleteTransaction /
            confirm.openDeleteCategory depending on currentPage if you want */}
      </Modal>

      <MyConfirmBox
        show={confirm.showConfirm}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.handleConfirm}
        onCancel={confirm.handleCancel}
      />
    </>
  );
};

export default ModalBase;