import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './page_styles/home.css'; // Import CSS file for styling
import { fetchParentServices } from './api'; // Assuming this is the correct API call

const HeroSection = () => {
  const [selectedService, setSelectedService] = useState(null); // Track selected service
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({}); // State to track form data
  const navigate = useNavigate();

  // Function to fetch services
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

  // Fetch services on component mount
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

  // Handle input changes in the form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Update the state dynamically based on the input's name
    }));
  };

  // Handle service selection
  const handleServiceClick = (service) => {
      
    setSelectedService(service.name);
    //setFormData({}); // Reset form data when a new service is selected
    navigate(`/service/${service.id}`, { state: { selectedService: service.name } });
  };

  // Close the form overlay
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
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Do you want the kitchen to be cleaned as well?</label>
              <select
                name="kitchen"
                value={formData.kitchen || ''}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>How old are they?</label>
              <input
                type="text"
                name="age_of_kids"
                value={formData.age_of_kids || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Anything else that you would like us to know?</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Anything else that you would like us to know?</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
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
          {renderFormFields()}
          <button type="submit" onClick={handleFormSubmit}>
            Let's find Sahayaks for you
          </button>
        </form>
      </div>
    );
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <nav className="navbar">
          <div className="navbar-logo">SAHAYAK</div>
          <div className="navbar-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#contact" className="navbar-contact">Contact</a>
          </div>
        </nav>

        <div className="hero-container">
          <div className="hero-image">
            <img
              src="https://www.housecallpro.com/wp-content/uploads/2024/04/home-service-business-ideas.webp"
              alt="Hero"
            />
          </div>

          <div className="hero-text">
            <h1>Connecting You With Trusted Service Providers For All Your Household Needs.</h1>
            <button className="hero-button">View Services</button>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="services-section">
        <h2 className="services-title">Explore What We Offer</h2>
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
    </div>
  );
};

export default HeroSection;
