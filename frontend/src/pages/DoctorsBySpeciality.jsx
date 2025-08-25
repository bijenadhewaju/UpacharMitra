import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useContext } from 'react';

const DoctorsBySpeciality = ({ doctorsInHospital }) => {
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const navigate = useNavigate();
    const { backendUrl } = useContext(AppContext);

    // ✅ KEY FIX #1: Correctly extract specialty names from the doctor list
    const uniqueSpecialties = useMemo(() => {
        if (!doctorsInHospital) return ['All'];
        // Get the specialty string directly from each doctor
        const specialties = doctorsInHospital.map(doc => doc.specialty);
        // Filter out any nulls/undefined and create a unique list
        return ['All', ...new Set(specialties.filter(Boolean))];
    }, [doctorsInHospital]);

    // ✅ KEY FIX #2: Filter doctors based on the selected specialty string
    const filteredDoctors = useMemo(() => {
        if (!doctorsInHospital) return [];
        if (selectedSpecialty === 'All') {
            return doctorsInHospital;
        }
        // Directly compare the doctor's specialty string with the selected one
        return doctorsInHospital.filter(doc => doc.specialty === selectedSpecialty);
    }, [doctorsInHospital, selectedSpecialty]);
    
    const getImageUrl = (photoUrl) => {
        if (!photoUrl) return '/default-doctor.png';
        if (photoUrl.startsWith('http')) return photoUrl;
        const cleanBackendUrl = backendUrl.replace(/\/api\/$/, '');
        return `${cleanBackendUrl}${photoUrl}`;
    };

    if (!doctorsInHospital) {
        return <p className="text-center text-gray-500 mt-8">Loading doctors...</p>;
    }

    return (
        <div className="py-8">
            <div className="flex flex-wrap gap-2 mb-8">
                {uniqueSpecialties.map(specialtyName => (
                    <button
                        key={specialtyName}
                        onClick={() => setSelectedSpecialty(specialtyName)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedSpecialty === specialtyName
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {specialtyName}
                    </button>
                ))}
            </div>

            {filteredDoctors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
                        <div
                            key={doctor.id}
                            onClick={() => navigate(`/book-appointment`, { state: { doctor } })}
                            className="cursor-pointer bg-white border rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <img src={getImageUrl(doctor.photo)} alt={`Dr. ${doctor.name}`} className="w-full h-56 object-cover" />
                            <div className="p-4">
                                <p className="text-lg font-bold text-gray-900">Dr. {doctor.name}</p>
                                <p className="text-sm text-green-600 font-semibold">
                                    {doctor.specialty}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <p className="text-center text-gray-500 mt-8 col-span-full bg-white p-6 rounded-lg shadow-sm">
                    No doctors found for this specialty at this hospital.
                </p>
            )}
        </div>
    );
};

export default DoctorsBySpeciality;