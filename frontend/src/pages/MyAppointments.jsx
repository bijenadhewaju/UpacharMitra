import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyAppointments = () => {
    const { backendUrl, token } = useContext(AppContext);
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Helper to format the "YYYY-MM-DD" date string
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const [year, month, day] = dateStr.split('-');
        const dateObj = new Date(year, month - 1, day);
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const getImageUrl = (photoUrl) => {
        if (!photoUrl) return '/default-doctor.png';
        return photoUrl; // The URL from your API is already absolute
    };

    useEffect(() => {
        if (token) {
            setIsLoading(true);
            axios.get(`${backendUrl}my-appointments/`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                setAppointments(response.data);
            })
            .catch(error => {
                console.error("Failed to load appointments:", error);
                toast.error("Failed to load your appointments.");
            })
            .finally(() => setIsLoading(false));
        }
    }, [token, backendUrl]);
    
    if (isLoading) {
        return <div className="text-center py-20">Loading your appointments...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Appointments</h1>
            
            {appointments.length > 0 ? (
                <div className="space-y-6">
                    {appointments.map((item) => {
                        // --- ❗ KEY FIX: Determine status based on fields from your API ---
                        let displayStatus = 'Unknown';
                        let statusStyles = 'bg-gray-100 text-gray-800';

                        if (item.cancelled) {
                            displayStatus = 'Cancelled';
                            statusStyles = 'bg-red-100 text-red-800';
                        } else if (item.payment) {
                            displayStatus = 'Booked';
                            statusStyles = 'bg-green-100 text-green-800';
                        } else {
                            displayStatus = 'Pending Payment';
                            statusStyles = 'bg-yellow-100 text-yellow-800';
                        }

                        return (
                            <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row items-center gap-6">
                                <img 
                                    className="w-28 h-28 rounded-full object-cover border-4 border-gray-100" 
                                    src={getImageUrl(item.doctor_photo)} 
                                    alt={`Dr. ${item.doctor_name}`} 
                                />
                                <div className="flex-1 text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row justify-between items-center">
                                        <h2 className="text-2xl font-bold text-gray-900">{item.doctor_name}</h2>
                                        <span className={`mt-2 sm:mt-0 px-3 py-1 text-sm font-semibold rounded-full ${statusStyles}`}>
                                            {displayStatus}
                                        </span>
                                    </div>
                                    <p className="text-md text-gray-600 font-medium">{item.doctor_specialty}</p>
                                    <div className="border-t my-4"></div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-700">
                                        <div className="text-center">
                                            <p className="font-semibold">Date</p>
                                            {/* --- ❗ KEY FIX: Use item.date --- */}
                                            <p>{formatDate(item.date)}</p> 
                                        </div>
                                        <div className="text-center">
                                            <p className="font-semibold">Time</p>
                                            {/* --- ❗ KEY FIX: Use item.time --- */}
                                            <p>{item.time}</p> 
                                        </div>
                                        <div className="text-center">
                                            <p className="font-semibold">Address</p>
                                            {/* --- ❗ KEY FIX: Use item.doctor_address --- */}
                                            <p className="text-xs">{item.doctor_address}</p> 
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <p className="text-xl text-gray-500">You have no appointments scheduled.</p>
                    <Link to="/doctors" className="mt-4 inline-block bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition">
                        Find a Doctor
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyAppointments;