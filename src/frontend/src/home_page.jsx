import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './page_styles/home.css';
import { fetchParentServices, fetchUserInfo } from './api';
import Sahayak from './all_services';

const HeroSection = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getServices();
  }, []);

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

  return (
    <div className="home-page">
      {/* Hero Section with left image */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-image">
            <img src="https://www.odtap.com/wp-content/uploads/2022/12/46776-scaled.jpg" alt="Home Services" />
          </div>
          <div className="hero-text">
            <h1>Welcome to SAHAYAK</h1>
            
            <p className="hero-description">
              More than chores – we provide care, comfort, and convenience for your everyday needs.
            </p>
            <div className="hero-buttons">
              <button className="hero-button primary" onClick={() => navigate('/services')}>
                Explore Services
              </button>
              <button className="hero-button secondary" onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="section-separator">
        <h2 className="separator-title">Our Services</h2>
      </div>

      <div className="services-section" id="services">
        <Sahayak/>
      </div>

      {/* About Us Section */}
      <div className="section-separator">
        <h2 className="separator-title">About Us</h2>
        
      </div>

      <div className="about-section" id="about">
        <div className="about-content">
          <div className="about-text">
            <h2>About Us</h2>
            <p>
              At SAHAYAK, we understand the challenges of managing household tasks while balancing a busy life. 
              Our mission is to bring comfort, convenience, and trust into every household. We connect you with 
              skilled professionals who are committed to providing exceptional service.
            </p>
            <p>
              Whether you need regular cleaning, cooking assistance, or specialized services, we're here to make 
              your life easier and more comfortable. Our platform ensures a seamless experience from booking to 
              service delivery.
            </p>
          </div>
          <div className="about-features">
            <div className="feature">
              <i className="fas fa-shield-alt"></i>
              <h3>Trusted Professionals</h3>
              <p>All our service providers are thoroughly vetted and trained</p>
            </div>
            <div className="feature">
              <i className="fas fa-clock"></i>
              <h3>Flexible Scheduling</h3>
              <p>Book services at your convenience, any day of the week</p>
            </div>
            <div className="feature">
              <i className="fas fa-star"></i>
              <h3>Quality Service</h3>
              <p>Guaranteed satisfaction with every service we provide</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;