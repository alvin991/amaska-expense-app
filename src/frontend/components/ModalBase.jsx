import { useState, useEffect } from 'react';
import ModalStateManager from '../services/ModalStateManager';
import { PAGE_TYPES } from '../types/PageConfig';
import TransactionEntryPage, { DEFAULT_TRANSACTION } from './TransactionEntryPage';
import CategoryListPage from './CategoryListPage';
import CategoryDetailsPage, { DEFAULT_CATEGORY } from './CategoryDetailsPage';
import IconSelectPage from './IconSelectPage';
import ColorSelectPage from './ColorSelectPage';
import Modal from 'react-bootstrap/Modal';

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

  // --- NAVIGATION STACK ------------------------------------------------------
  // each entry: { page: string, params?: any }
  const [navStack, setNavStack] = useState([{ page: ROOT_PAGE, params: null }]);

  const currentEntry = navStack[navStack.length - 1];
  const currentPage = currentEntry?.page ?? ROOT_PAGE;
  const currentParams = currentEntry?.params ?? null;

  // --- SHARED MODAL STATE ----------------------------------------------------
  const [stateManager] = useState(
    () => new ModalStateManager(PAGE_TYPES.TRANSACTION, propTransaction)
  );
  const [state, setState] = useState(stateManager.getState());
  const [transaction, setTransaction] = useState(effectiveTransaction);
  const [propCategory, setPropCategory] = useState(DEFAULT_CATEGORY);

  // --- EFFECTS ---------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = stateManager.subscribe(setState);
    return unsubscribe;
  }, [stateManager]);

  // keep stateManager + transaction in sync when propTransaction changes
  useEffect(() => {
    const next = propTransaction ?? DEFAULT_TRANSACTION;
    setTransaction(next);
    stateManager.reset(PAGE_TYPES.TRANSACTION, next);
    setNavStack([{ page: ROOT_PAGE, params: null }]);
  }, [propTransaction, stateManager]);

  useEffect(() => {
    if (isOpen) {
      stateManager.reset(PAGE_TYPES.TRANSACTION, transaction);
      // reset navigation when modal is (re)opened
      setNavStack([{ page: ROOT_PAGE, params: null }]);
    }
  }, [isOpen, stateManager, transaction]);

  // --- DOMAIN HELPERS --------------------------------------------------------
  const updateCategoryId = (categoryId) => {
    setTransaction((prev) => ({
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
    console.log(`Current page: ${currentPage}`);

    switch (currentPage) {
    case 'transaction':
      return (
        <TransactionEntryPage
          paymentMethods={paymentMethods}
          categories={categories}
          transaction={transaction}
          navigation={navigation}
          refreshTransactions={refreshTransactions}
          onHide={onHide}
          setTransaction={setTransaction}
        />
      );

    case 'categoryList':
      return (
        <CategoryListPage
          categories={categories}
          categoriesUsed={categoriesUsed}
          transaction={transaction}
          updateCategoryId={updateCategoryId}
          navigation={navigation}
          setTransaction={setTransaction}
        />
      );

    case 'categoryDetails':
      return (
        <CategoryDetailsPage
          propCategory={propCategory}
          navigation={navigation}
          refreshCategories={refreshCategories}
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

  return (
    <Modal
      show={isOpen}
      onHide={onHide}
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
              onClick={navigation.back}
            >
              &larr; Back
            </button>
          )}
        </div>

        {/* Center (Title, truly centered) */}
        <Modal.Title
          className="text-center"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%', // so it doesn't overlap buttons
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
            onClick={onHide}
          >
            Cancel
          </button>
        </div>
      </Modal.Header>

      <Modal.Body>
        {renderPageContent()}
      </Modal.Body>
    </Modal>
  );
};

export default ModalBase;