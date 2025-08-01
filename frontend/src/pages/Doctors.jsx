import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Doctors = () => {
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();
    const { speciality } = useParams(); // This gets the specialty name from the URL, like "Cardiology"

    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        
        // --- ✅ KEY FIX ---
        // It now builds the correct API URL. If a specialty is in the URL,
        // it adds it as a query parameter for the backend to use.
        let apiUrl = `${backendUrl}doctors/`;
        if (speciality) {
            apiUrl = `${backendUrl}doctors/?specialty=${speciality}`;
        }

        axios.get(apiUrl)
            .then(response => {
                setDoctors(response.data);
            })
            .catch(error => {
                console.error("Error fetching doctors:", error);
                toast.error("Could not load the list of doctors.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [backendUrl, speciality]); // This ensures the component re-fetches data if the URL specialty changes

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
        return <div className="text-center py-20">Loading doctors...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900">
                        {/* The title now dynamically changes based on the specialty */}
                        {speciality ? `${speciality} Specialists` : 'Meet Our Specialists'}
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">Find the best doctor for your needs from our expert team.</p>
                </div>

                {doctors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {doctors.map(doctor => (
                            <div key={doctor.id} className="bg-white rounded-xl shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                                <img src={getImageUrl(doctor.photo)} alt={`Dr. ${doctor.name}`} className="w-full h-64 object-cover" />
                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900">Dr. {doctor.name}</h3>
                                    {/* The specialty name now comes directly from the doctor object */}
                                    <p className="text-md text-green-600 font-semibold mt-1">
                                        {doctor.specialty || 'No Specialty'}
                                    </p>
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
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <p className="text-xl text-gray-600">No doctors found for this specialty.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Doctors;