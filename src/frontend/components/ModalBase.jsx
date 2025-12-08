import { useState, useEffect } from 'react';
import TransactionEntryPage from './TransactionEntryPage';
import CategoryListPage from './CategoryListPage';
import CategoryDetailsPage from './CategoryDetailsPage';
import IconSelectPage from './IconSelectPage';
import ColorSelectPage from './ColorSelectPage';
import Modal from 'react-bootstrap/Modal';
import MyConfirmBox from "./MyConfirmBox";
import { useModalConfirm } from '../hooks/useModalConfirm';
import { deleteTransactionById } from '../services/transactionService';
import { deleteCategoryById } from '../services/categoryService';
import { DEFAULT_TRANSACTION, DEFAULT_CATEGORY } from '../constants/defaults';

const ROOT_PAGE = 'transaction';

const ModalBase = ({
  paymentMethods = [],
  categories = [],
  propTransaction = DEFAULT_TRANSACTION,
  categoriesUsed = [],
  isOpen = false,
  refreshTransactions,
  refreshCategories,
  refreshPaymentMethods,
  onHide,
}) => {
  const effectiveTransaction = propTransaction ?? DEFAULT_TRANSACTION;
  const [transactionOriginal, setTransactionOriginal] = useState(effectiveTransaction);
  const [transactionDraft, setTransactionDraft] = useState(effectiveTransaction);
  const [propCategory, setPropCategory] = useState(DEFAULT_CATEGORY);

  // --- LOCAL STATE FOR CONFIRM NAVIGATION -----------------------------------
  const [isDirty, setIsDirty] = useState(false);

  // --- NAVIGATION STACK ------------------------------------------------------
  const [navStack, setNavStack] = useState([{ page: ROOT_PAGE, params: null }]);

  const currentEntry = navStack[navStack.length - 1];
  const currentPage = currentEntry?.page ?? ROOT_PAGE;
  const currentParams = currentEntry?.params ?? null;

  // when the row / propTransaction changes
  useEffect(() => {
    const next = propTransaction ?? DEFAULT_TRANSACTION;
    setTransactionOriginal(next);
    setTransactionDraft(next);
    setIsDirty(false);
    setNavStack([{ page: ROOT_PAGE, params: null }]);
  }, [propTransaction]);

  // recompute isDirty whenever draft changes
  useEffect(() => {
    const o = transactionOriginal;
    const d = transactionDraft;
    const dirty = JSON.stringify(o) !== JSON.stringify(d);
    setIsDirty(dirty);
  }, [transactionOriginal, transactionDraft]);

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
    setNavStack([{ page: ROOT_PAGE, params: null }]);
  };

  const navigation = {
    navigate,
    back,
    resetToRoot,
    currentPage,
    canGoBack: navStack.length > 1,
  };

  // --- TITLE (optional, based on page) --------------------------------------
  const getTitle = () => {
    switch (currentPage) {
      case 'transaction':
        return 'Transaction';
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
    if (!transactionDraft?.transaction_id) return;
    await deleteTransactionById(transactionDraft.transaction_id);
    if (refreshTransactions) await refreshTransactions();
  };

  const deleteCategory = async () => {
    if (!propCategory?.id) return;
    await deleteCategoryById(propCategory.id);
    if (refreshCategories) await refreshCategories();
  };

  const actuallyHide = () => {
    setTransactionDraft(DEFAULT_TRANSACTION);
    setTransactionOriginal(DEFAULT_TRANSACTION);
    setIsDirty(false);
    onHide();
  };

  // --- CONFIRM CONTROLLER HOOK ----------------------------------------------
  const confirm = useModalConfirm({
    deleteTransaction,
    deleteCategory,
    onHide: actuallyHide,      // use wrapper, not raw onHide
    navigationBack: back,
    clearDirty: () => setIsDirty(false),
  });

  // --- RENDER SWITCH ---------------------------------------------------------
  const renderPageContent = () => {
    switch (currentPage) {
      case 'transaction':
        return (
          <TransactionEntryPage
            transaction={transactionDraft}
            paymentMethods={paymentMethods}
            categories={categories}
            navigation={navigation}
            refreshTransactions={refreshTransactions}
            onHide={actuallyHide}
            onChangeDraft={setTransactionDraft}
            isDirty={isDirty}
            onDelete={confirm.openDeleteTransaction}
          />
        );

      case 'categoryList':
        return (
          <CategoryListPage
            categories={categories}
            categoriesUsed={categoriesUsed}
            transaction={transactionDraft}
            navigation={navigation}
            onCategorySelected={(categoryId) => {
              setTransactionDraft(prev => ({
                ...prev,
                category_id: categoryId,
              }));
            }}
          />
        );

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
    if (isDirty) {
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
            {currentPage !== 'transaction' && (
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