import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './page_styles/task_form.css';

const TaskForm = () => {
  const [formData, setFormData] = useState({
    city:'',
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
  const { selectedService } = location.state || {};
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(0);

  const updateProgress = (updatedFormData) => {
    let steps = completedSteps;
    if (updatedFormData.city) steps = 1;
    if (
      (selectedService === 'Cleaning Service' && (updatedFormData.rooms && updatedFormData.kitchen && updatedFormData.bathroom)) ||
      (selectedService === 'Nanny Service' && (updatedFormData.number_of_kids && updatedFormData.age_of_kids)) ||
      (selectedService === 'Cooking Service' && (updatedFormData.meal_type && updatedFormData.number_of_persons))
    ) {
      steps = 2;
    }
    
    if (updatedFormData.description) steps = 3;
    setCompletedSteps(steps);
    console.log(completedSteps, "&&&&&&&&&",steps, updatedFormData.city)
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams(formData).toString();
    navigate(`/service_providers?${queryParams}`);
  };

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    console.log(e.target, "//////////////////", name, value)
    
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    console.log(updatedFormData, "§§§§§§§§§§§§§§§§§§")
    updateProgress(updatedFormData);
  };

  const renderFormFields = () => {

    switch (selectedService) {
      case 'Cleaning Service':
        return (
          <>
            <div className="form-section">
              <label>Number of rooms to clean:</label>
              <input
                type="number"
                name="rooms"
                value={formData.rooms || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-section">
              <label>Do you want the kitchen to be cleaned as well?</label>
              <select
                name="kitchen"
                value={formData.kitchen || ''}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="form-section">
              <label>Do you want the bathroom to be cleaned as well?</label>
              <select
                name="bathroom"
                value={formData.bathroom || ''}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </>
        );
      case 'Nanny Service':
        return (
          <>
            <div className="form-section">
              <label>How many kids do you need help with?</label>
              <input
                type="number"
                name="number_of_kids"
                value={formData.number_of_kids || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-section">
              <label>How old are they?</label>
              <input
                type="text"
                name="age_of_kids"
                value={formData.age_of_kids || ''}
                onChange={handleChange}
                required
              />
            </div>
          </>
        );
      case 'Cooking Service':
        return (
          <>
            <div className="form-section">
              <label>What kind of meal do you want?</label>
              <select
                name="meal_type"
                value={formData.meal_type || ''}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="vegetarian_meal">Vegetarian</option>
                <option value="vegan_meal">Vegan</option>
                <option value="non_vegetarian_meal">Non-Vegetarian</option>
              </select>
            </div>
            <div className="form-section">
              <label>For how many people?</label>
              <input
                type="number"
                name="number_of_persons"
                value={formData.number_of_persons || ''}
                onChange={handleChange}
                required
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
        <div
          className="progress-fill"
          style={{ width: `${(completedSteps - 1) * 33}%` }}
        ></div>
        <div className={`progress-step ${completedSteps >= 1 ? 'active' : ''}`}>
          <span>1</span>
          <p>Your locality</p>
        </div>
        <div className={`progress-step ${completedSteps >= 2 ? 'active' : ''}`}>
          <span>2</span>
          <p>Task details</p>
        </div>
        <div className={`progress-step ${completedSteps >= 3 ? 'active' : ''}`}>
          <span>3</span>
          <p>Further description</p>
        </div>
        <div className={`progress-step ${completedSteps >= 4 ? 'active' : ''}`}>
          <span>4</span>
          <p>Confirm</p>
        </div>
      </div>

      {/* Form Content */}
      <div className="form-content">
        <h2>{selectedService}</h2>
        <div className="form-section">
          <label>In which city would you like the service?</label>
          <select
            id="city-dropdown"
            name="city"
            value={formData.city}
            onChange={handleChange}
          >
            <option value="">--Select a City--</option>
            <option name="city" value="frankfurt">Frankfurt</option>
            <option name="city" value="munich">Munich</option>
            <option name="city" value="berlin">Berlin</option>
          </select>
        </div>
        <div className="form-section">{renderFormFields()}</div>

        <div className="form-section">
          <label>Tell us the details of your task</label>
          <textarea
            name="description"
            placeholder="Describe the task details here"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <button className="continue-button" type="button" onClick={handleFormSubmit}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default TaskForm;
