import React from 'react';
import '../page_styles/toast.css';

const Toast = ({ message, type, onClose }) => {
  return (
    <div className={`toast ${type}`}>
      <div className="toast-content">
        <i className={`fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
        <span>{message}</span>
        <button className="close-toast" onClick={onClose}>✖</button>
      </div>
    </div>
  );
};

export default Toast; 