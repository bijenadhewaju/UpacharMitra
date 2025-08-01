import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const AdminDoctorSchedulePage = () => {
    const { backendUrl, token } = useContext(AppContext);
    const { doctorId } = useParams(); // Get doctor ID from the URL
    const navigate = useNavigate();

    const [doctorName, setDoctorName] = useState('');
    const [allDays, setAllDays] = useState([]);
    const [allTimes, setAllTimes] = useState([]);
    const [selectedDays, setSelectedDays] = useState(new Set());
    const [selectedTimes, setSelectedTimes] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token && doctorId) {
            axios.get(`${backendUrl}admin/doctors/${doctorId}/schedule/`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                const { doctor_name, all_options, current_schedule } = response.data;
                setDoctorName(doctor_name);
                setAllDays(all_options.days);
                setAllTimes(all_options.times);
                setSelectedDays(new Set(current_schedule.day_ids));
                setSelectedTimes(new Set(current_schedule.time_ids));
            })
            .catch(err => toast.error("Could not load doctor's schedule."))
            .finally(() => setIsLoading(false));
        }
    }, [token, backendUrl, doctorId]);

    const handleDayToggle = (dayId) => {
        const newSelection = new Set(selectedDays);
        if (newSelection.has(dayId)) {
            newSelection.delete(dayId);
        } else {
            newSelection.add(dayId);
        }
        setSelectedDays(newSelection);
    };

    const handleTimeToggle = (timeId) => {
        const newSelection = new Set(selectedTimes);
        if (newSelection.has(timeId)) {
            newSelection.delete(timeId);
        } else {
            newSelection.add(timeId);
        }
        setSelectedTimes(newSelection);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${backendUrl}admin/doctors/${doctorId}/schedule/`, {
                day_ids: Array.from(selectedDays),
                time_ids: Array.from(selectedTimes),
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            toast.success("Schedule updated successfully!");
            navigate('/admin/doctors');
        } catch (error) {
            toast.error("Failed to update schedule.");
        }
    };

    if (isLoading) {
        return <div className="text-center py-10">Loading Schedule...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Edit Schedule for Dr. {doctorName}</h1>
            
            {/* Available Days Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Available Days</h2>
                <div className="flex flex-wrap gap-4">
                    {allDays.map(day => (
                        <button type="button" key={day.id} onClick={() => handleDayToggle(day.id)}
                            className={`px-4 py-2 rounded-full font-semibold ${selectedDays.has(day.id) ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                        >
                            {day.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Available Times Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Available Time Slots</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {allTimes.map(time => (
                        <button type="button" key={time.id} onClick={() => handleTimeToggle(time.id)}
                            className={`px-3 py-2 rounded-lg font-mono ${selectedTimes.has(time.id) ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                        >
                            {time.time.slice(0, 5)}
                        </button>
                    ))}
                </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700">
                Save Schedule
            </button>
        </form>
    );
};

export default AdminDoctorSchedulePage;