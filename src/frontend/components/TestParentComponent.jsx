import React, { useState } from 'react';
import Modal from './TestModal'; // Your custom Modal component
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import EditProductForm from './EditProductForm';

function ParentComponent() {
  const [showModal, setShowModal] = useState(false);
  const [currentForm, setCurrentForm] = useState(''); // e.g., 'login', 'signup', 'editProduct'

  const openModal = (formType) => {
    setCurrentForm(formType);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentForm(''); // Clear form type on close
  };

  const renderForm = () => {
    switch (currentForm) {
      case 'login':
        return <LoginForm onClose={closeModal} />;
      case 'signup':
        return <SignupForm onClose={closeModal} />;
      case 'editProduct':
        // You might pass specific data to the edit form as props
        return <EditProductForm productId={123} onClose={closeModal} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <button onClick={() => openModal('login')}>Open Login</button>
      <button onClick={() => openModal('signup')}>Open Signup</button>
      <button onClick={() => openModal('editProduct')}>Edit Product</button>

      <Modal show={showModal} handleClose={closeModal}>
        {renderForm()}
      </Modal>
    </div>
  );
}

export default ParentComponent;