import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchParentServices } from './api';

const CityPage = () => {
  const [selectedService, setSelectedService] = useState(null); // Track selected service
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({}); // State to track form data
  const navigate = useNavigate();

  // Function to fetch users
  const getServices = async () => {
    try {
      const response = await fetchParentServices();
      setServices(response);
    } catch (error) {
      setError('Failed to get services');
    } finally {
      setLoading(false);
    }
  };

  // Fetch services
  useEffect(() => {
    getServices();
  }, []);

  // ServiceCard component to display each service
  const ServiceCard = ({ service, onClick }) => {
    return (
      <div className="service-card" onClick={onClick}>
        <img src={service.image} alt={service.name} />
        <h3>{service.name}</h3>
        <p>{service.description}</p>
      </div>
    );
  };

  // Function to handle input changes in the form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input Change - Name:', name, 'Value:', value); // Debugging log

    // Update the form data state with the new value
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Update the state dynamically based on the input's name
    }));
  };

  // Function to handle service selection
  const handleServiceClick = (service) => {
    setSelectedService(service);
    setFormData({}); // Reset form data when a new service is selected
  };

  // Function to close the form overlay
  const handleOverlayClick = () => {
    setSelectedService(null); // Close the form
  };

  // Prevent event propagation when clicking inside the form
  const handleFormClick = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up to overlay
  };

  // Handle form submission and pass form data as params to the next page
  const handleFormSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Navigate with the form data as query parameters
    const queryParams = new URLSearchParams(formData).toString();
    navigate(`/service_providers?${queryParams}`);
  };

  // Render service-specific form fields based on selected service
  const renderFormFields = () => {
    switch (selectedService?.name) {
      case 'Cleaning Service':
        return (
          <>
            <div>
              <label>Number of rooms to clean:</label>
              <input
                type="number"
                name="rooms"
                value={formData.rooms || ''}
                onChange={handleInputChange} // Track input change
                required
              />
            </div>
            <div>
              <label>Do you want the kitchen to be cleaned as well?</label>
              <select
                name="kitchen"
                value={formData.kitchen || ''}
                onChange={handleInputChange} // Track input change
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
                onChange={handleInputChange} // Track input change
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
                onChange={handleInputChange} // Track input change
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
                onChange={handleInputChange} // Track input change
                required
              />
            </div>
            <div>
              <label>How old are they?</label>
              <input
                type="text"
                name="age_of_kids"
                value={formData.age_of_kids || ''}
                onChange={handleInputChange} // Track input change
                required
              />
            </div>
            <div>
              <label>Anything else that you would like us to know?</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange} // Track input change
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
                onChange={handleInputChange} // Track input change
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
                onChange={handleInputChange} // Track input change
                required
              />
            </div>
            <div>
              <label>Anything else that you would like us to know?</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange} // Track input change
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Render form based on the selected service
  const renderForm = () => {
    return (
      <div className="form-overlay" onClick={handleOverlayClick}>
        <form className="service-form" onClick={handleFormClick}>
          <h2>{selectedService?.name} Form</h2>
          {/* Render service-specific questions */}
          {renderFormFields()}
          <button type="submit" onClick={handleFormSubmit}>
            Let's find Sahayaks for you
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="page-container">
      <h1>How may Sahayak serve you?</h1>
      <div className={`services-grid ${selectedService ? 'dim-background' : ''}`}>
        {services.map((service) => (
          <ServiceCard
            key={service.name}
            service={service}
            onClick={() => handleServiceClick(service)}
          />
        ))}
      </div>

      {/* Conditionally render the form if a service is selected */}
      {selectedService && renderForm()}
    </div>
  );
};

export default CityPage;
