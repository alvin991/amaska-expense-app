// Modal.js
import React from 'react';
import './Modal.css'; // Assuming you have some CSS for the modal

function Modal({ show, handleClose, children }) {
  const showHideClassName = show ? 'modal display-block' : 'modal display-none';

  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        {children}
        <button onClick={handleClose}>Close</button>
      </section>
    </div>
  );
}

export default Modal;