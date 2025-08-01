import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminManageDoctorsPage = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            setIsLoading(true);
            
            // ✅ KEY FIX: Call the new, correct endpoint for this hospital's doctors
            axios.get(`${backendUrl}admin/my-doctors/`, { 
                headers: { Authorization: `Bearer ${token}` } 
            })
            .then(response => {
                setDoctors(response.data);
            })
            .catch(err => toast.error("Could not load your hospital's doctors list."))
            .finally(() => setIsLoading(false));
        }
    }, [token, backendUrl]);
    
    const getImageUrl = (photoUrl) => {
        if (!photoUrl) return '/default-doctor.png';
        if (photoUrl.startsWith('http')) return photoUrl;
        const cleanBackendUrl = backendUrl.replace(/\/api\/$/, '');
        return `${cleanBackendUrl}${photoUrl}`;
    };

    if (isLoading) {
        return <div className="text-center py-10">Loading Your Doctors...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Doctor Schedules</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {doctors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map(doctor => (
                            <div key={doctor.id} className="border p-4 rounded-lg flex flex-col items-center text-center shadow-sm">
                                <img src={getImageUrl(doctor.photo)} alt={`Dr. ${doctor.name}`} className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-200" />
                                <h3 className="text-lg font-bold text-gray-800">{doctor.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{doctor.specialty}</p>
                                <button
                                    onClick={() => navigate(`/admin/doctors/${doctor.id}/schedule`)}
                                    className="mt-auto w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition"
                                >
                                    Edit Schedule
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">You have not added any doctors to your hospital yet.</p>
                )}
            </div>
        </div>
    );
};

export default AdminManageDoctorsPage;