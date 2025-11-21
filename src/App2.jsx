import React, { useState } from 'react';
import Modal from './frontend/components/ModalParent';
import TransactionPage from './frontend/components/TransactionPage';
import CategoryListPage from './frontend/components/CategoryListPage';
import CategoryDetailsPage from './frontend/components/CategoryDetailsPage';

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('transaction');

  const renderPageContent = () => {
    switch (currentPage) {
      case 'transaction':
        return <TransactionPage onNavigate={setCurrentPage} />;
      case 'categoryList':
        return <CategoryListPage onNavigate={setCurrentPage} />;
      case 'categoryDetails':
        return <CategoryDetailsPage onNavigate={setCurrentPage} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h1>Expense App</h1>
      <button onClick={() => {
        setCurrentPage('transaction');
        setIsModalOpen(true);
      }}>
        Open Modal
      </button>

      <Modal
        isOpen={isModalOpen}
        title={`Current Page: ${currentPage}`}
        content={renderPageContent()}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default App;