import React, { useState } from 'react';
import { updateUserInfo } from './api';
import './page_styles/onboarding_modal.css';

const OnboardingModal = ({ onClose, user }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    id: user?.id,
    city: '',
    gender: '',
    role: ''
  });

  const cities = [
    'BERLIN',
    'MUNICH',
    'FRANKFURT'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await updateUserInfo(formData);
      onClose();
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-content">
            <h2>Welcome! Which city are you from?</h2>
            <select 
              name="city" 
              value={formData.city} 
              onChange={handleInputChange}
              className="select-input"
            >
              <option value="">Select your city</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city.charAt(0) + city.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <h2>What's your gender?</h2>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleInputChange}
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleInputChange}
                />
                Female
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === 'other'}
                  onChange={handleInputChange}
                />
                Other
              </label>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <h2>How would you like to use Sahayak?</h2>
            <div className="role-buttons">
              <button
                type="button"
                className={`role-button ${formData.role === 'client' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'client' })}
              >
                I need services
              </button>
              <button
                type="button"
                className={`role-button ${formData.role === 'provider' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'provider' })}
              >
                I want to provide services
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="progress-bar">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`progress-step ${step >= stepNumber ? 'active' : ''}`}
            />
          ))}
        </div>
        
        {renderStep()}

        <div className="button-group">
          {step > 1 && (
            <button type="button" className="back-button" onClick={handleBack}>
              Back
            </button>
          )}
          <button
            type="button"
            className="next-button"
            onClick={handleNext}
            disabled={
              (step === 1 && !formData.city) ||
              (step === 2 && !formData.gender) ||
              (step === 3 && !formData.role)
            }
          >
            {step === 3 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal; 