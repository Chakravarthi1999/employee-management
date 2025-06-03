import React from 'react';

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-modal-backdrop">
      <div className="confirm-modal">
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="yes-btn" onClick={onConfirm}>Yes</button>
          <button className="no-btn" onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
