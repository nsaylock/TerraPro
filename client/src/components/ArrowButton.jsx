function ArrowButton({ direction, label, onClick }) {
  return (
    <button type='button' className='invis-btn' aria-label={label} onClick={onClick}>
      <div className={`${direction}-arrow`}></div>
    </button>
  );
}

export default ArrowButton;