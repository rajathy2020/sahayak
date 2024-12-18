import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './page_styles/home.css';
import { fetchParentServices } from './api';

const HomeServices = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  // Add useEffect to fetch services when component mounts
  useEffect(() => {
    getServices();
  }, []);

  const getServices = async () => {
    try {
      const response = await fetchParentServices();
      setServices(response);
      setLoading(false);
    } catch (error) {
      setError('Failed to get services');
      setLoading(false);
    }
  };

  const ServiceCard = ({ service, onClick }) => (
    <div className="service-card" onClick={onClick}>
      <img src={service.image || 'default-image-url.jpg'} alt={service.name} />
      <div className="service-tag">
        {service.name.toLowerCase().includes('combo') ? 'Combo' : 'Service'}
      </div>
      <div className="service-card-content">
        <h3>{service.name}</h3>
        <p>{service.description}</p>
        <div className="service-features">
          <span className="feature-item">Professional Staff</span>
          <span className="feature-item">Quality Service</span>
        </div>
        <div className="service-card-footer">
          <span className="service-price">Starting from €{service.base_price}</span>
          <button className="service-action">Book Now</button>
        </div>
      </div>
    </div>
  );

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

  if (loading) {
    return (
      <div>
        <div className="section-separator">
          <div className="skeleton title-skeleton"></div>
        </div>
        
        <div className="services-section">
          <div className="services-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="service-card skeleton-card">
                <div className="skeleton image-skeleton"></div>
                <div className="skeleton text-skeleton title"></div>
                <div className="skeleton text-skeleton"></div>
                <div className="skeleton text-skeleton"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-separator">
          <div className="skeleton title-skeleton"></div>
        </div>
        
        <div className="services-section">
          <div className="services-grid">
            {[1, 2].map((n) => (
              <div key={n} className="service-card skeleton-card">
                <div className="skeleton image-skeleton"></div>
                <div className="skeleton text-skeleton title"></div>
                <div className="skeleton text-skeleton"></div>
                <div className="skeleton text-skeleton"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      {/* Regular Services Section */}
      <div className="section-separator">
        <h2 className="separator-title">Our Services</h2>
      </div>
      
      <div className="services-section" id="services">
        <div className={`services-grid ${selectedService ? 'dim-background' : ''}`}>
          {regularServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => handleServiceClick(service)}
            />
          ))}
        </div>
      </div>

      {/* Separator for heading */}
      {comboServices.length > 0 && (
        <>
          <div className="section-separator">
            <h2 className="separator-title">Exclusive Combos</h2>
          </div>

          {/* Combo Services Section */}
          <div className="services-section" id="combo-services">
            <div className="services-grid">
              {comboServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onClick={() => handleServiceClick(service)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomeServices;

