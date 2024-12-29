import React, { useState } from 'react';
import '../page_styles/rating_modal.css';

const RatingModal = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
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

  const renderBoxes = () => {
    return [1, 2, 3, 4, 5].map((box) => (
      <div
        key={box}
        className={`rating-box ${box <= rating ? 'active' : ''}`}
        onClick={() => setRating(box)}
        aria-label={`Rate ${box} stars`}
      >
        {box}
      </div>
    ));
  };

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <h2>Rate Your Experience</h2>
        <p>How was your service with {booking.provider_name}?</p>

        <div className="rating-boxes-container">
          {renderBoxes()}
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