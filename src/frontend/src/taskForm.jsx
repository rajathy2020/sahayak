import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import './page_styles/task_form.css'; // Import CSS for styling

const TaskForm = () => {
  const [formData, setFormData] = useState({
    address: '',
    unit: '',
    taskDetails: '',
    rooms: '',
    kitchen: '',
    bathroom: '',
    number_of_kids: '',
    age_of_kids: '',
    meal_type: '',
    number_of_persons: '',
    description: '',
  });
  const location = useLocation();
  const { selectedService } = location.state || {}; // Retrieve service name from state

  console.log(selectedService, "&&&&&&&&&&&&")

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const renderFormFields = () => {
    switch (selectedService) {
      case 'Cleaning Service':
        return (
          <>
            <div>
              <label>Number of rooms to clean:</label>
              <input
                type="number"
                name="rooms"
                value={formData.rooms || ''}
                onChange={handleChange} // Track input change
                required
              />
            </div>
            <div>
              <label>Do you want the kitchen to be cleaned as well?</label>
              <select
                name="kitchen"
                value={formData.kitchen || ''}
                onChange={handleChange} // Track input change
                required
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label>Do you want the bathroom to be cleaned as well?</label>
              <select
                name="bathroom"
                value={formData.bathroom || ''}
                onChange={handleChange} // Track input change
                required
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label>Anything else that you would like us to know?</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange} // Track input change
              />
            </div>
          </>
        );
      case 'Nanny Service':
        return (
          <>
            <div>
              <label>How many kids do you need help with?</label>
              <input
                type="number"
                name="number_of_kids"
                value={formData.number_of_kids || ''}
                onChange={handleChange} // Track input change
                required
              />
            </div>
            <div>
              <label>How old are they?</label>
              <input
                type="text"
                name="age_of_kids"
                value={formData.age_of_kids || ''}
                onChange={handleChange} // Track input change
                required
              />
            </div>
            <div>
              <label>Anything else that you would like us to know?</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange} // Track input change
              />
            </div>
          </>
        );
      case 'Cooking Service':
        return (
          <>
            <div>
              <label>What kind of meal do you want?</label>
              <select
                name="meal_type"
                value={formData.meal_type || ''}
                onChange={handleChange} // Track input change
                required
              >
                <option value="">Select</option>
                <option value="vegetarian_meal">Vegetarian</option>
                <option value="vegan_meal">Vegan</option>
                <option value="non_vegetarian_meal">Non-Vegetarian</option>
              </select>
            </div>
            <div>
              <label>For how many people?</label>
              <input
                type="number"
                name="number_of_persons"
                value={formData.number_of_persons || ''}
                onChange={handleChange} // Track input change
                required
              />
            </div>
            <div>
              <label>Anything else that you would like us to know?</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange} // Track input change
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };


  return (
    <div className="task-form-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-step active">
          <span>1</span>
          <p>Describe your task</p>
        </div>
        <div className="progress-step">
          <span>2</span>
          <p>Task options</p>
        </div>
        <div className="progress-step">
          <span>3</span>
          <p>Details</p>
        </div>
        <div className="progress-step">
          <span>4</span>
          <p>Confirmation</p>
        </div>
      </div>

      {/* Form Content */}
      <div className="form-content">
        <h2>{selectedService?.name}</h2>

        <div className="form-section">
          <label>Your task location</label>
          <input
            type="text"
            name="address"
            placeholder="Street address"
            value={formData.address}
            onChange={handleChange}
          />
          <input
            type="text"
            name="unit"
            placeholder="Unit or apt #"
            value={formData.unit}
            onChange={handleChange}
          />
        </div>

        {/* Dynamic Task Options */}
        <div className="form-section">
          <label>Task options</label>
          {renderFormFields()}
        </div>

        {/* Task details */}
        <div className="form-section">
          <label>Tell us the details of your task</label>
          <textarea
            name="taskDetails"
            placeholder="Describe the task details here"
            value={formData.taskDetails}
            onChange={handleChange}
          />
        </div>

        {/* Continue Button */}
        <button className="continue-button">Continue</button>
      </div>
    </div>
  );
};


export default TaskForm;
