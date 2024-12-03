import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './page_styles/home.css';
import { fetchParentServices, fetchUserBookings, fetchUserInfo } from './api';

const HeroSection = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    getServices();
    getUserInfo();
  }, []);

  const ServiceCard = ({ service, onClick }) => (
    <div className="service-card" onClick={onClick}>
      <img src={service.image} alt={service.name} />
      <h3>{service.name}</h3>
      <p>{service.description}</p>
    </div>
  );

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

  const getUserInfo = async () => {
    try {
      const response = await fetchUserInfo();
      setUser(response);
    } catch (error) {
      setError('Failed to get user');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = (service) => {
    setSelectedService(service.name);
    navigate(`/service/${service.id}`, { state: { selectedService: service.name } });
  };

  const comboServices = services.filter((service) =>
    service.name.toLowerCase().includes('combo')
  );
  const regularServices = services.filter(
    (service) => !service.name.toLowerCase().includes('combo')
  );

  return (
    <div>
      {/* Hero Section */}
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

      {/* Separator for heading */}
      <div className="section-separator">
        <h2 className="separator-title">Explore What We Offer</h2>
      </div>

      {/* Regular Services Section */}
      <div className="services-section" id="services">
        <div className={`services-grid ${selectedService ? 'dim-background' : ''}`}>
          {regularServices.map((service) => (
            <ServiceCard
              key={service.name}
              service={service}
              onClick={() => handleServiceClick(service)}
            />
          ))}
        </div>
      </div>

      {/* Separator for heading */}
      <div className="section-separator">
        <h2 className="separator-title">Exclusive Combos</h2>
      </div>

      {/* Combo Services Section */}
      {comboServices.length > 0 && (
        <div className="services-section" id="combo-services">
          <div className="services-grid">
            {comboServices.map((service) => (
              <ServiceCard
                key={service.name}
                service={service}
                onClick={() => handleServiceClick(service)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Separator for heading */}
      <div className="section-separator">
        <h2 className="separator-title">About Us</h2>
      </div>

      {/* About Us Section */}
      <div className="about-section" id="about">
        <p>
          At SAHAYAK, we are dedicated to simplifying everyday life. From home services to
          personalized care, our mission is to bring comfort, convenience, and trust into every
          household. Our team is composed of skilled professionals who are committed to providing
          exceptional service to meet your needs.
        </p>
        <p>
          We believe that finding reliable help should be easy and stress-free. Our platform
          connects you with trained service providers who can assist with various tasks, allowing
          you to focus on what truly matters.
        </p>
      </div>
    </div>
  );
};

export default HeroSection;