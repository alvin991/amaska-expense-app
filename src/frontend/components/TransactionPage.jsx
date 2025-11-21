import { useState, useEffect } from 'react';
import MyForm from './MyForm';

function TransactionPage({ 
  data: transaction, 
  paymentMethods = [], 
  categories = [], 
  onSuccess, 
  onClose 
}) {

  useEffect(() => {
      setTransaction(transaction || {});

  }, [isOpen, initialPage]);
  return (
    <MyForm
      transaction={transaction}
      paymentMethods={paymentMethods}
      categories={categories}
      onHide={onClose}
      onSuccess={onSuccess}
    />
  );
}

export default TransactionPage;