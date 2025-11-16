import './Modal.css';
import Modal from 'react-bootstrap/Modal';

const ModalParent = ({ isOpen, title, content, onClose }) => {
    if (!isOpen) return null;

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
                test
                {content}
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