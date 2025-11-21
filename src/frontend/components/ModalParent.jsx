import { useState, useEffect } from 'react';
import './Modal.css';
import Modal from 'react-bootstrap/Modal';
import TransactionPage from './TransactionPage';
import CategoryListPage from './CategoryListPage';
import CategoryDetailsPage from './CategoryDetailsPage';

const ModalParent = ({ isOpen, title, onClose, onSuccess, currentPage: initialPage = 'transaction', transaction: initialTransaction, paymentMethods, categories, categoriesUsed }) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [transaction, setTransaction] = useState(initialTransaction || {});

    // Reset to transaction page whenever modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentPage(initialPage);
            setTransaction(initialTransaction || {});
        }
    }, [isOpen, initialPage]);

    if (!isOpen) return null;

    const renderPageContent = () => {
        switch (currentPage) {
        case 'transaction':
            return <TransactionPage 
                    transaction={transaction}
                    setTransaction={setTransaction}
                    paymentMethods={paymentMethods}
                    categories={categories}
                    onHide={onClose}
                    onSuccess={onSuccess}
                    onNavigate={setCurrentPage} />;
        case 'categoryList':
            return <CategoryListPage 
                    categories={categories}
                    categoriesUsed={categoriesUsed}
                    transaction={transaction}
                    setTransaction={setTransaction}
                    onHide={onClose}
                    onNavigate={setCurrentPage} />;
        case 'categoryDetails':
            return <CategoryDetailsPage onNavigate={setCurrentPage} />;
        default:
            return null;
        }
    };

    return (
        // <div className="modal-overlay" onClick={onClose}>
        //   <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        //     <div className="modal-header">
        //       <h2>{title}</h2>
        //       <button className="modal-close" onClick={onClose}>×</button>
        //     </div>
        //     <div className="modal-body">
        //       {content}
        //     </div>
        //   </div>
        // </div>

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
                <Modal.Title>
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {renderPageContent()}
                {/* <MyForm 
          paymentMethods={paymentMethods} 
          categories={categories} 
          transaction={transaction}
          onHide={onHide}
          onSuccess={onSuccess}
        /> */}
            </Modal.Body>
        </Modal>
    );
};

export default ModalParent;