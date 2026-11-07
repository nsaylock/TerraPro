import '../css/Modal.css'
function Modal({isOpen, onClose, children}) {
  if (!isOpen) return null;

  return (
    <div className='modal-overlay'>
      <div className='modal-main'>
        <button 
          className='modal-esc'
          onClick={onClose}
        >&times;</button>
        {children}
      </div>
    </div>
  )
}

export default Modal