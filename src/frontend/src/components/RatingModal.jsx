import React, { useState } from 'react';
import '../page_styles/rating_modal.css';

const RatingModal = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        provider_id: booking.provider_id,
        booking_id: booking.id,
        rating,
        comment
      });
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`star-btn ${star <= (hoveredRating || rating) ? 'active' : ''}`}
        onMouseEnter={() => setHoveredRating(star)}
        onMouseLeave={() => setHoveredRating(0)}
        onClick={() => {
          setRating(star);
          if (window.navigator.vibrate) {
            window.navigator.vibrate(50);
          }
        }}
        aria-label={`Rate ${star} stars`}
      >
        <i className="fas fa-star"></i>
      </button>
    ));
  };

  const getRatingText = () => {
    const texts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return hoveredRating || rating ? texts[hoveredRating || rating] : 'Select Rating';
  };

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <h2>Rate Your Experience</h2>
        <p>How was your service with {booking.provider_name}?</p>

        <div className="rating-stars-container">
          <div className="stars-wrapper">
            {renderStars()}
          </div>
          <span className="rating-text">
            {rating === 0 ? (
              <span className="rating-required">
                <i className="fas fa-exclamation-circle"></i>
                Rating required
              </span>
            ) : (
              getRatingText()
            )}
          </span>
        </div>

        <textarea
          placeholder="Share your experience (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />

        <button
          className={`submit-btn ${rating === 0 ? 'disabled' : ''}`}
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? (
            <>
              <span className="spinner"></span>
              Submitting...
            </>
          ) : (
            <>
              <i className="fas fa-star"></i>
              Submit Rating
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default RatingModal; 