import React from 'react';
import '../page_styles/toast.css';

const Toast = ({ message, type, onClose }) => {
  return (
    <div className={`toast-notification ${type}`}>
      <div className="toast-content">
        <i className={`fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>
        <i className="fas fa-times"></i>
      </button>
      <div className="toast-progress"></div>
    </div>
  );
};

export default Toast; 