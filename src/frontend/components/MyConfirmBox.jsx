import { Modal, Button } from 'react-bootstrap';

const ConfirmationModal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) {
    return null; // Don't render if not visible
  }

  return (
    <>
      <Modal
        show={show}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={onConfirm}>Confirm</Button>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ConfirmationModal;