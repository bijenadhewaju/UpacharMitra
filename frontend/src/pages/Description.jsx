import React from 'react';

const Description = ({ hospital }) => {
  return (
    <div className="section description-section">
      <h2>About {hospital.name}</h2>
      <p>{hospital.description}</p>
    </div>
  );
};

export default Description;