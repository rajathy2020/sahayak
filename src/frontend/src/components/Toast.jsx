import React from 'react';
import '../page_styles/toast.css';

const Toast = ({ message, type, onClose }) => {
  return (
    <div className={`toast ${type}`} onClick={onClose}>
      <div className="toast-content">
        <i className={`fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast; 