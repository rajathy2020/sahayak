import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './page_styles/home.css';
import { fetchParentServices, fetchUserBookings } from './api';

const HeroSection = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getServices();
  }, []);

  const ServiceCard = ({ service, onClick }) => {
    return (
      <div className="service-card" onClick={onClick}>
        <img src={service.image} alt={service.name} />
        <h3>{service.name}</h3>
        <p>{service.description}</p>
      </div>
    );
  };

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

  const handleUserBookings = async () => {
    try {
      const response = await fetchUserBookings();
      setBookings(response);
      setShowDropdown(true);
    } catch (error) {
      setError('Failed to get user bookings');
    }
    navigate(`/my_bookings`);
  };

  const handleServiceClick = (service) => {
    setSelectedService(service.name);
    navigate(`/service/${service.id}`, { state: { selectedService: service.name } });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams(formData).toString();
    navigate(`/service_providers?${queryParams}`);
  };

  const renderFormFields = () => {
    // Render form fields based on selected service
  };

  const renderForm = () => (
    <div className="form-overlay" onClick={() => setSelectedService(null)}>
      <form className="service-form" onClick={(e) => e.stopPropagation()}>
        <h2>{selectedService?.name} Form</h2>
        {renderFormFields()}
        <button type="submit" onClick={handleFormSubmit}>
          Let's find Sahayaks for you
        </button>
      </form>
    </div>
  );

  return (
    <div>
      <div className="hero-section">
        

        <div className="hero-container">
          <div className="hero-image">
            <img
              src="https://www.odtap.com/wp-content/uploads/2022/12/46776-scaled.jpg"
              alt="Hero"
            />
          </div>
          <div className="hero-text">
            <h1>More than chores – we provide care, comfort, and convenience.</h1>
            <button className="hero-button">View Services</button>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="services-section" id="services">
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
        {selectedService && renderForm()}
      </div>

      {/* About Us Section */}
      <div className="about-section" id="about">
        <h2>About Us</h2>
        <p>
          At SAHAYAK, we are dedicated to simplifying everyday life. From home services to personalized care, our mission is to bring comfort, convenience, and trust into every household. Our team is composed of skilled professionals who are committed to providing exceptional service to meet your needs.
        </p>
        <p>
          We believe that finding reliable help should be easy and stress-free. Our platform connects you with trained service providers who can assist with various tasks, allowing you to focus on what truly matters.
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
{/* <nav className="navbar">
          <div className="navbar-logo">SAHAYAK</div>
          <div className="navbar-links">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
            <div
              className="navbar-user"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              Me
              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={handleUserBookings}>
                    My Bookings
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav> */}