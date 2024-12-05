import React, { useState } from 'react';
import './page_styles/modal.css'; // Add this file for styling

const UserPreferencesModal = ({ show, onClose, onSave }) => {
  const [userType, setUserType] = useState('');
  const [city, setCity] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  console.log("show", show)

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ userType, city, mobileNumber });
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
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              required
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value="CLIENT">Take Service</option>
              <option value="SERVICE_PROVIDER">Provide Service</option>
            </select>
          </div>
          <div className="form-group">
            <label>City:</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            >
              <option value="" disabled>Select a city</option>
              <option value="BERLIN">Berlin</option>
              <option value="MUNICH">Munich</option>
              <option value="FRANKFURT">Frankfurt</option>
            </select>
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
