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
      <h3>{service.name}</h3>
      <p>{service.description}</p>
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
    return <div>Loading...</div>;
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

