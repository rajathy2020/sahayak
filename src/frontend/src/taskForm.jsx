import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTaskForm } from './TaskFormContext';
import './page_styles/task_form.css';
import { fetchCalculatedPrice } from './api';

const TaskForm = () => {
  const [formData, setFormData] = useState({
    city: '',
    cleaning_type: '',
    taskDetails: '',
    rooms: '',
    kitchen: '',
    bathroom: '',
    number_of_kids: '',
    age_of_kids: '',
    meal_type: '',
    number_of_persons: '2',
    description: '',
    number_of_rooms: '2',
    price: 0
  });

  const location = useLocation();
  const { selectedService } = location.state || {};
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState(0);
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const updatedFormData = { ...formData, price: price };
    
    // Pass data using state
    navigate('/service_providers', { state: { taskFormData: updatedFormData } });
  };

  const calculatePrice = async (names, persons=2, rooms = 2) => {
    const filteredNames = names.filter(name => name);
    const params = {
      name: selectedService,
      sub_service_names: filteredNames,
      number_of_persons: persons,
      number_of_rooms: rooms
    }
    try {
      const response = await fetchCalculatedPrice(params);
      console.log("ssss", response)
      return response.price;
    }
    catch (error) {
      setError('Failed to calculate price', error);
      alert('An error occurred while calculating price', error);
    } finally {
      setLoading(false);
    }
    
  };

  const handleChange = async (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    let updatedValue = value;

    // Ensure number_of_persons cannot go below 2
    if (name === 'number_of_persons' && value < 2) {
      updatedValue = 2;
    }

    const updatedFormData = { ...formData, [name]: updatedValue };
    setFormData(updatedFormData);
    updateProgress(updatedFormData);

    if (selectedService === 'Cooking Service' && updatedFormData.meal_type) {
      const newPrice =  await calculatePrice([updatedFormData.meal_type], parseInt(updatedFormData.number_of_persons) || 2);
      setPrice(newPrice);
      
    }
    if (selectedService === 'Cleaning Service' && updatedFormData.cleaning_type) {
      const newPrice = await calculatePrice([updatedFormData.cleaning_type, updatedFormData.kitchen, updatedFormData.bathroom], 2,  parseInt(updatedFormData.rooms) || 2);
      setPrice(newPrice);
    }
  };

  const renderFormFields = () => {
    switch (selectedService) {
      case 'Cleaning Service':
        return (
          <>
            <div className="form-section">
              <label>What kind of cleaning are you looking for?</label>
              <select
                name="cleaning_type"
                value={formData.cleaning_type || ''}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="deep_clean">Deep clean</option>
                <option value="regular_clean">Regular Clean</option>
              </select>
            </div>
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
                <option value="kitchen">Yes</option>
                <option value="">No</option>
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
                <option value="bathroom">Yes</option>
                <option value="">No</option>
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
                value={formData.number_of_persons || '2'}
                onChange={handleChange}
                min="2"
                required
                disabled={!formData.meal_type}
                onWheel={(e) => e.preventDefault()}
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

      {/* Display Price if Available */}
      {price && (
        <div className="price-display">
          <h3>Estimated Price: ${price}</h3>
        </div>
      )}

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
            <option name="city" value="FRANKFURT">Frankfurt</option>
            <option name="city" value="MUNICH">Munich</option>
            <option name="city" value="BERLIN">Berlin</option>
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
