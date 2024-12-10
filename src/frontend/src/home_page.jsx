import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './page_styles/home.css';
import { fetchParentServices, fetchUserBookings, fetchUserInfo, extractDocumentInfo1, askDocumentQuestion } from './api';

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

      {/* Add the AI Services section */}
      <AIServicesSection />
    </div>
  );
};

const AIServicesSection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const documentTypes = [
    { value: 'SALARY', label: 'Salary Document' },
    { value: 'HOUSE_CONTRACT', label: 'House Contract' },
    { value: 'UTILITY_BILL', label: 'Utility Bill' },
    { value: 'SOCIAL_SECURITY', label: 'Social Security Document' },
    { value: 'JOB_CONTRACT', label: 'Job Contract' },
    { value: 'HEALTH_INSURANCE', label: 'Health Insurance' },
    { value: 'TAX_DOCUMENT', label: 'Tax Document' },
    { value: 'RESIDENCE_PERMIT', label: 'Residence Permit' },
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a PDF file');
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile || !documentType) {
      setError('Please select both a file and document type');
      return;
    }

    setLoading(true);
    setError(null);


    
    try {
      const response = await extractDocumentInfo1(selectedFile, documentType);
      setExtractedData(response.extracted_info);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render extracted data as a table
  const renderExtractedData = (data) => {
    if (!data) return null;

    const renderValue = (value) => {
      if (typeof value === 'object' && value !== null) {
        return <pre>{JSON.stringify(value, null, 2)}</pre>;
      }
      return value;
    };

    return (
      <table className="extracted-data-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{renderValue(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !question.trim()) {
      setError('Please upload a file and enter a question');
      return;
    }

    setChatLoading(true);
    setError(null);

    try {
      const response = await askDocumentQuestion(selectedFile, question);
      setChatHistory(prev => [...prev, {
        question,
        answer: response.response.answer,
        confidence: response.response.confidence,
        relevantText: response.response.relevant_text
      }]);
      setQuestion('');
      
      // Scroll to bottom of chat
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const renderChatMessage = (message, index) => (
    <div key={index} className="chat-message">
      <div className="question">
        <strong>Q:</strong> {message.question}
      </div>
      <div className="answer">
        <strong>A:</strong> {message.answer}
        <div className="confidence-level">
          Confidence: <span className={`confidence-${message.confidence}`}>
            {message.confidence}
          </span>
        </div>
        {message.relevantText && (
          <div className="relevant-text">
            <small>
              <strong>Relevant text:</strong> {message.relevantText}
            </small>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="ai-services-section">
      <div className="section-separator">
        <h2 className="separator-title">AI Document Analysis</h2>
      </div>
      
      <div className="ai-services-container">
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="documentType">Document Type:</label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
            >
              <option value="">Select document type</option>
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="file">Upload PDF:</label>
            <input
              type="file"
              id="file"
              accept=".pdf"
              onChange={handleFileChange}
              required
            />
          </div>

          <button type="submit" disabled={loading || !selectedFile || !documentType}>
            {loading ? 'Processing...' : 'Analyze Document'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
        
        {extractedData && (
          <div className="results-container">
            <h3>Extracted Information</h3>
            {renderExtractedData(extractedData)}
          </div>
        )}

        {/* New Chat Interface */}
        <div className="chat-section">
          <h3>Ask Questions About Your Document</h3>
          <div className="chat-container" ref={chatContainerRef}>
            {chatHistory.map((message, index) => renderChatMessage(message, index))}
            {chatLoading && (
              <div className="chat-loading">
                Processing your question...
              </div>
            )}
          </div>
          <form onSubmit={handleQuestionSubmit} className="chat-form">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your document..."
              disabled={!selectedFile || chatLoading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={!selectedFile || !question.trim() || chatLoading}
              className="chat-submit"
            >
              {chatLoading ? 'Processing...' : 'Ask'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;