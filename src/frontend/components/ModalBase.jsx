import { useState, useEffect } from 'react';
import ModalStateManager from '../services/ModalStateManager';
import { PAGE_TYPES } from '../types/PageConfig';
import TransactionEntryPage, { DEFAULT_TRANSACTION } from './TransactionEntryPage';
import CategoryListPage from './CategoryListPage';
import CategoryDetailsPage, { DEFAULT_CATEGORY } from './CategoryDetailsPage';
import IconSelectPage from './IconSelectPage';
import ColorSelectPage from './ColorSelectPage';
import Modal from 'react-bootstrap/Modal';
import MyConfirmBox from "./MyConfirmBox";

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

  // --- SHARED MODAL STATE ----------------------------------------------------
  const [stateManager] = useState(
    () => new ModalStateManager(PAGE_TYPES.TRANSACTION, propTransaction)
  );
  const [state, setState] = useState(stateManager.getState());

  const [transactionOriginal, setTransactionOriginal] = useState(effectiveTransaction);
  const [transactionDraft, setTransactionDraft] = useState(effectiveTransaction);
  const [propCategory, setPropCategory] = useState(DEFAULT_CATEGORY);

  // --- LOCAL STATE FOR CONFIRM NAVIGATION -----------------------------------
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // when the row / propTransaction changes
  useEffect(() => {
    const next = propTransaction ?? DEFAULT_TRANSACTION;
    setTransactionOriginal(next);
    setTransactionDraft(next);
    setIsDirty(false);
    stateManager.reset(PAGE_TYPES.TRANSACTION, next);
    setNavStack([{ page: ROOT_PAGE, params: null }]);
  }, [propTransaction, stateManager]);

  // recompute isDirty whenever draft changes
  useEffect(() => {
    const o = transactionOriginal;
    const d = transactionDraft;
    const dirty = JSON.stringify(o) !== JSON.stringify(d);
    setIsDirty(dirty);
  }, [transactionOriginal, transactionDraft]);

  // --- NAVIGATION STACK ------------------------------------------------------
  // each entry: { page: string, params?: any }
  const [navStack, setNavStack] = useState([{ page: ROOT_PAGE, params: null }]);

  const currentEntry = navStack[navStack.length - 1];
  const currentPage = currentEntry?.page ?? ROOT_PAGE;
  const currentParams = currentEntry?.params ?? null;

  // --- DOMAIN HELPERS --------------------------------------------------------
  const updateCategoryId = (categoryId) => {
    setTransactionDraft((prev) => ({
      ...prev,
      category_id: categoryId,
      category_name: categories.find((cat) => cat.id === categoryId)?.name ?? '',
    }));
  };

  // --- NAVIGATION API (CONTAINER RESPONSIBILITY) -----------------------------
  const navigate = (page, params = null) => {
    // optional: keep some derived state in container
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
    // expose where we are if needed by presentation components
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

  // --- RENDER SWITCH ---------------------------------------------------------
  const renderPageContent = () => {
    switch (currentPage) {
    case 'transaction':
      return (
        <TransactionEntryPage
          transaction={transactionDraft}          // draft, not original
          paymentMethods={paymentMethods}
          categories={categories}
          navigation={navigation}
          refreshTransactions={refreshTransactions}
          onHide={onHide}
          onChangeDraft={setTransactionDraft}    // <-- updater
          isDirty={isDirty}                      // <-- result of comparison
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
        />
      );

    case 'iconSelect':
      return (
        <IconSelectPage
          navigation={navigation}
          {...currentParams}   // expects { selectedIconKey, onIconChosen, icons? }
        />
      );

    case 'colorSelect':
      return (
        <ColorSelectPage
          navigation={navigation}
          {...currentParams}   // expects { value, onColorChosen, colors? }
        />
      );

    default:
      return null;
    }
  };

  const handleRequestClose = () => {
    if (isDirty) {
      setShowConfirm(true);
    } else {
      onHide();
    }
  };

  const handleRequestBack = () => {
    if (isDirty) {
      setShowConfirm(true);
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
                onClick={handleRequestBack}   // <-- use dirty-aware handler
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
              onClick={handleRequestClose}    // <-- was onHide
            >
              Cancel
            </button>
          </div>
        </Modal.Header>

        <Modal.Body>
          {renderPageContent()}
        </Modal.Body>
      </Modal>

      <MyConfirmBox
        show={showConfirm}
        title="Discard changes?"
        message="You have unsaved changes. Do you really want to leave this page?"
        onConfirm={() => {
          setShowConfirm(false);
          setIsDirty(false);
          onHide();            // finally close
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};

export default ModalBase;