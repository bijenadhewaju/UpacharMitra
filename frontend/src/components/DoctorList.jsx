import React from 'react';
import { Link } from 'react-router-dom';

const DoctorList = ({ doctors }) => {
  return (
    <div className="doctor-list">
      {doctors.map((doctor) => (
        <Link to={`/appointment/${doctor.id}`} key={doctor.id} className="doctor-card">
          <img src={doctor.photo} alt={doctor.name} className="doctor-image" />
          <h3>{doctor.name}</h3>
          <p>{doctor.specialty}</p>
        </Link>
      ))}
    </div>
  );
};

export default DoctorList;
