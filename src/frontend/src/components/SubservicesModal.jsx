import React from 'react';
import '../page_styles/modal.css'; // Add your modal styles here

const SubservicesModal = ({ show, onClose, subservices, selectedSubservices, onSubserviceChange, onSave }) => {
  if (!show) return null;
  console.log('selectedSubservices', selectedSubservices, subservices)

  return (
    <div className="modal-overlay">
      <div className="provider-onboarding-modal">
        <div className="modal-header">
          <h2>Edit Subservices</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-content">
          {subservices.map(subservice => (
            <div key={subservice.id} className="subservice-card">
              <label>
                <input
                  type="checkbox"
                  value={subservice.id}
                  checked={selectedSubservices.includes(subservice._id)}
                  onChange={() => onSubserviceChange(subservice._id)}
                />
                <div className="subservice-info">
                  <h4>{subservice.name}</h4>
                  {subservice.description && <p>{subservice.description}</p>}
                  {subservice.base_price && <p>€{subservice.base_price}/hr</p>}
                </div>
              </label>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="save-btn" onClick={() => {
            // Handle saving the selected subservices
            onSave(selectedSubservices); // Close the modal after saving
            onClose();
          }}>
            Update Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubservicesModal; 