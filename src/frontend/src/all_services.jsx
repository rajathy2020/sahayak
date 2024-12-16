import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './page_styles/all_services.css';
import { fetchParentServices } from './api';

const ServiceCard = ({ title, description, icon, onClick }) => (
    <div className="service-card" onClick={onClick}>
        <div className="service-card-content">
            <div className="service-icon">
                <i className={icon}></i>
            </div>
            <h2>{title}</h2>
            <p>{description}</p>
            <div className="service-card-arrow">
                <i className="fas fa-arrow-right"></i>
            </div>
        </div>
    </div>
);

const Sahayak = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleServiceClick = async (service) => {
        if (service === 'home') {
            setLoading(true);
            try {
                const response = await fetchParentServices();
                navigate('/services', { state: { services: response } });
            } catch (error) {
                setError('Failed to get services');
            } finally {
                setLoading(false);
            }
        }
        else if (service === 'documents') {
            navigate('/document-analysis');
        }
        else if (service === 'appointments') {
            navigate('/appointments');
        }
    };

    return (
        <div className="sahayak-container">
            <div className="services-grid">
                <ServiceCard
                    title="Home Services"
                    description="Professional cleaning, cooking, and maintenance services for your home"
                    icon="fas fa-home"
                    onClick={() => handleServiceClick('home')}
                />

                <ServiceCard
                    title="Document Analysis"
                    description="AI-powered document processing and analysis for better organization"
                    icon="fas fa-file-alt"
                    onClick={() => handleServiceClick('documents')}
                />

                <ServiceCard
                    title="Appointments"
                    description="Schedule and manage your service appointments efficiently"
                    icon="fas fa-calendar-alt"
                    onClick={() => handleServiceClick('appointments')}
                />
            </div>

            {loading && <div className="loading-overlay">
                <div className="loader"></div>
            </div>}

            {error && <div className="error-message">
                {error}
            </div>}
        </div>
    );
};

export default Sahayak;
