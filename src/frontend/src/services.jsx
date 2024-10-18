import React from 'react';
import './design.css'; // CSS for styling

const CircleDiagram = () => {
  return (
    <div className="circle-diagram-container">
      {/* Central Circle */}
      <div className="central-circle">
        <h3>Title Here</h3>
        <p>Some description in the center</p>
      </div>

      {/* Outer Circles */}
      <div className="outer-circle circle1">Deep cleaning</div>
      <div className="outer-circle circle2">After party cleaning</div>
      <div className="outer-circle circle3">Regular cleaning</div>
      <div className="outer-circle circle4">Meal for a couple</div>
      <div className="outer-circle circle5">Meal for a gathering</div>
      <div className="outer-circle circle6">Specialised meal</div>
      <div className="outer-circle circle7">Good care of your child</div>
      <div className="outer-circle circle8">Toddler care</div>

      {/* Four Notes on Four Corners */}
      <div className="corner-note corner-note-top-left">
        <h4>Title Here</h4>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
      <div className="corner-note corner-note-top-right">
        <h4>Title Here</h4>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
      <div className="corner-note corner-note-bottom-left">
        <h4>Title Here</h4>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
      <div className="corner-note corner-note-bottom-right">
        <h4>Title Here</h4>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
    
    </div>

  );
};

export default CircleDiagram;
