import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../css/Modal.css';

function Modal({ isOpen, onClose, children }) {
  // Close on Escape while the modal is open
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className='modal-overlay'
      // Only a click on the dark backdrop itself closes it, not clicks inside the modal
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className='modal-main' role='dialog' aria-modal='true'>
        <button type='button' className='modal-esc' aria-label='Close' onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
