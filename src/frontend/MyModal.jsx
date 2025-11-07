import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import MyForm from './MyForm';

function MyModal({ show, onHide, transaction, paymentMethods, categories, onSuccess}) {
  return (
    <Modal 
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
    </Modal>
  );
}

export default MyModal;