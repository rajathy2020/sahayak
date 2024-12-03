import React, { useState } from 'react';
import './page_styles/modal.css'; // Add this file for styling

const UserPreferencesModal = ({ show, onClose, onSave }) => {
  const [serviceType, setServiceType] = useState('');
  const [city, setCity] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ serviceType, city, mobileNumber });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Welcome! Let us know your preferences</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>I want to:</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              required
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value="take">Take Service</option>
              <option value="provide">Provide Service</option>
            </select>
          </div>
          <div className="form-group">
            <label>City:</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your city"
              required
            />
          </div>
          <div className="form-group">
            <label>Mobile Number:</label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter your mobile number"
              required
            />
          </div>
          <button type="submit">Save</button>
        </form>
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default UserPreferencesModal;
