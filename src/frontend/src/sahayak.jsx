import React from 'react';
import './design.css'; // External CSS for styling
import { useNavigate } from 'react-router-dom';
import ServicesBanner from './services';

const CityBanner = () => {
  const navigate = useNavigate();

  // Function to handle clicks and navigate to different routes
  const handleCityClick = (city) => {
    
    navigate(`/city/${city.toLowerCase()}`);
    
  };

  return (
    <div>
    <div className="city-banner-container">
      {/* Welcome message */}
      <div className="welcome-message">
        <h1>Welcome to City</h1>
      </div>

      {/* Left side with clickable cities spread evenly */}
      <div className="cities-container">
        {/* Berlin City Block */}
        <div className="city-block" onClick={() => handleCityClick('Berlin')}>
          <div className="city-content">
            <div className="city-overlay">
              <h2>Berlin</h2>
            </div>
            <img src="https://www.germany.travel/media/redaktion/staedte_kultur_content/berlin/Berlin_Brandenburger_Tor_am_Pariser_Platz_im_Sonnenuntergang_Leitmotiv_German_Summer_Cities.jpg" alt="Berlin" className="city-image" />
          </div>
        </div>

        {/* Frankfurt City Block */}
        <div className="city-block" onClick={() => handleCityClick('Frankfurt')}>
          <div className="city-content">
            <div className="city-overlay">
              <h2>Frankfurt</h2>
            </div>
            <img src="https://www.fnp.de/assets/images/21/824/21824918-frankfurt-innenstadt-tempolimit-3Bea.jpg" alt="Frankfurt" className="city-image" />
          </div>
        </div>

        {/* Munich City Block */}
        <div className="city-block" onClick={() => handleCityClick('Munich')}>
          <div className="city-content">
            <div className="city-overlay">
              <h2>Munich</h2>
            </div>
            <img src="https://cdn.britannica.com/06/152206-050-72BD5CAC/twin-towers-Church-of-Our-Lady-Munich.jpg" alt="Munich" className="city-image" />
          </div>
        </div>
      </div>
    </div>
    <ServicesBanner/>
  </div>
  );

};

export default CityBanner;
