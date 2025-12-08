import { useState } from 'react';

export function useModalConfirm({
  deleteTransaction,
  deleteCategory,
  onHide,
  navigationBack,
  clearDirty,
}) {
  // 'discard-cancel' | 'discard-back' | 'delete-transaction' | 'delete-category' | null
  const [mode, setMode] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const openDiscardCancel = () => {
    setMode('discard-cancel');
    setShowConfirm(true);
  };

  const openDiscardBack = () => {
    setMode('discard-back');
    setShowConfirm(true);
  };

  const openDeleteTransaction = () => {
    setMode('delete-transaction');
    setShowConfirm(true);
  };

  const openDeleteCategory = () => {
    setMode('delete-category');
    setShowConfirm(true);
  };

  const title = (() => {
    switch (mode) {
      case 'delete-transaction':
        return 'Delete transaction?';
      case 'delete-category':
        return 'Delete category?';
      case 'discard-cancel':
      case 'discard-back':
        return 'Discard changes?';
      default:
        return '';
    }
  })();

  const message = (() => {
    switch (mode) {
      case 'delete-transaction':
        return 'Are you sure you want to delete this transaction? This action cannot be undone.';
      case 'delete-category':
        return 'Are you sure you want to delete this category? This action cannot be undone.';
      case 'discard-cancel':
      case 'discard-back':
        return 'You have unsaved changes. Do you really want to leave this page?';
      default:
        return '';
    }
  })();

  const handleConfirm = async () => {
    setShowConfirm(false);

    switch (mode) {
      case 'delete-transaction':
        if (deleteTransaction) {
          await deleteTransaction();
        }
        clearDirty();
        onHide();
        break;

      case 'delete-category':
        if (deleteCategory) {
          await deleteCategory();
        }
        clearDirty();
        navigationBack();
        break;

      case 'discard-cancel':
        clearDirty();
        onHide();
        break;

      case 'discard-back':
        clearDirty();
        navigationBack();
        break;

      default:
        break;
    }

    setMode(null);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setMode(null);
  };

  return {
    showConfirm,
    title,
    message,
    openDiscardCancel,
    openDiscardBack,
    openDeleteTransaction,
    openDeleteCategory,
    handleConfirm,
    handleCancel,
  };
}