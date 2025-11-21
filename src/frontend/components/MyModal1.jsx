import { useState, useEffect } from 'react';
import './Modal.css';
import Modal from 'react-bootstrap/Modal';
import TransactionPage from './TransactionPage';
import CategoryListPage from './CategoryListPage';
import CategoryDetailsPage from './CategoryDetailsPage';

const MyModal1 = ({ isOpen, title, onClose, onSuccess, currentPage: initialPage = 'transaction', transaction: initialTransaction, paymentMethods, categories, categoriesUsed }) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [transaction, setTransaction] = useState(initialTransaction || {});

    // Reset to transaction page whenever modal opens
    useEffect(() => {
        if (isOpen) {
        setCurrentPage(initialPage);
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
            </Modal.Body>
        </Modal>
    );
};

export default MyModal1;