import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const AllDoctors = ({ hospitalId }) => {
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const apiUrl = `${backendUrl}doctors/?hospital_id=${hospitalId}`;
        axios.get(apiUrl)
            .then(response => {
                setDoctors(response.data);
            })
            .catch(error => {
                console.error("Error fetching doctors for hospital:", error);
                toast.error("Could not load the list of doctors for this hospital.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [hospitalId, backendUrl]);

    const handleDoctorClick = (doctor) => {
        navigate('/book-appointment', { state: { doctor } });
    };

    const getImageUrl = (photoUrl) => {
        if (!photoUrl) return '/default-doctor.png';
        if (photoUrl.startsWith('http')) return photoUrl;
        const cleanBackendUrl = backendUrl.replace(/\/api\/$/, '');
        return `${cleanBackendUrl}${photoUrl}`;
    };

    if (isLoading) {
        return <div className="text-center py-10">Loading doctors...</div>;
    }

    return (
        <div className="py-8">
            {doctors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {doctors.map(doctor => (
                        // --- ✅ CARD REDESIGN ---
                        <div key={doctor.id} className="bg-white rounded-xl shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 flex flex-col text-center">
                            <div className="relative">
                                <img src={getImageUrl(doctor.photo)} alt={`Dr. ${doctor.name}`} className="w-full h-64 object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900">Dr. {doctor.name}</h3>
                                <p className="text-md text-green-600 font-semibold mt-1 flex-grow">
                                    {doctor.specialty || 'No Specialty'}
                                </p>
                                {/* --- ✅ BUTTON REDESIGN --- */}
                                <button
                                    onClick={() => handleDoctorClick(doctor)}
                                    className="mt-4 w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 bg-white p-8 rounded-lg shadow">
                    No doctors are listed for this hospital yet.
                </p>
            )}
        </div>
    );
};

export default AllDoctors;