import React from 'react';

const ServiceProviderCard = ({ provider, handleBookingClick, onChatClick }) => {
  return (
    <div className="service-provider-card">
      {/* Provider Image */}
      <img
        src={provider.image || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'}
        alt={provider.name}
        className="provider-image"
      />

      {/* Provider Information */}
      <div className="provider-info">
        <h3 className="provider-name">{provider.name}</h3>
        <p className="provider-description">{provider.description}</p>

        {/* Ratings Section */}
        <div className="provider-ratings">
          <span className="average-rating">Average Rating: {provider.ratings.average.toFixed(1)} ⭐</span>
          <span className="total-ratings">({provider.ratings.count} ratings)</span>
          <div className="comments">
            {provider.ratings.comments.slice(0, 3).map((comment, index) => (
              <p key={index} className="comment">{comment}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button className="book-button" onClick={() => handleBookingClick(provider)}>
          Book Now
        </button>
        <button className="chat-button" onClick={() => onChatClick(provider)}>
          Chat with Provider
        </button>
      </div>
    </div>
  );
};

export default ServiceProviderCard; 