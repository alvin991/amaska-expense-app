import { useState } from 'react';
import ModalParent from './ModalParent';
import TransactionPage from './TransactionPage';
import CategoryListPage from './CategoryListPage';
import CategoryDetailsPage from './CategoryDetailsPage';
import { Form } from 'react-bootstrap';

function CategoryModal() {
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

  const handleSelectClick = (e) => {
    console.log(`Select clicked`);
    e.preventDefault();
    setCurrentPage('transaction');
    setIsModalOpen(true);
  };

  return (
    <div>
      <Form.Select
        name="category"
        // value={"abc"}
        onMouseDown={handleSelectClick}
        onClick={(e) => e.preventDefault()}
      >
        <option value={"Grocery"}>{"Grocery"}</option>
      </Form.Select>

      <ModalParent
        isOpen={isModalOpen}
        title={`Current Page: ${currentPage}`}
        content={renderPageContent()}
        onClose={() => setIsModalOpen(false)}
        size='lg'
        centered
        backdrop="static"
        keyboard={false}
      />

      {/* <Modal 
        show={show} 
        onHide={onHide}
        dialogClassName="modal-90w"
        size='lg'
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {transaction ? 'Edit' : 'New'} Transaction
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MyForm 
            paymentMethods={paymentMethods} 
            categories={categories} 
            transaction={transaction}
            onHide={onHide}
            onSuccess={onSuccess}
          />
        </Modal.Body>
      </Modal> */}
    </div>
  );
};

export default CategoryModal;