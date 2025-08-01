import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const HospitalAppointment = () => {
    const { state } = useLocation();
    const { doctor } = state || {};
    const navigate = useNavigate();

    const { token, loading, backendUrl } = useContext(AppContext);

    const [selectedHospitalId, setSelectedHospitalId] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [currentPrice, setCurrentPrice] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    useEffect(() => {
        if (doctor) {
            if (doctor.hospitals?.length > 0) {
                const initialHospital = doctor.hospitals[0];
                setSelectedHospitalId(initialHospital.hospital_id);
                setCurrentPrice(initialHospital.opd_charge);
            }
            if (doctor.available_days?.length > 0) {
                setSelectedDay(doctor.available_days[0]);
            }
        } else if (!loading) {
            toast.error("Doctor details not found. Redirecting...");
            navigate('/doctors');
        }
    }, [doctor, navigate, loading]);

    useEffect(() => {
        if (doctor && selectedDay) {
            setSlotsLoading(true);
            setAvailableSlots([]);
            setSelectedTime('');

            const today = new Date();
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const targetDayIndex = daysOfWeek.indexOf(selectedDay);
            let daysToAdd = targetDayIndex - today.getDay();
            if (daysToAdd <= 0) {
                daysToAdd += 7;
            }
            const targetDate = new Date();
            targetDate.setDate(today.getDate() + daysToAdd);
            const dateString = targetDate.toISOString().split('T')[0];

            axios.get(`${backendUrl}available-slots/?doctor_id=${doctor.id}&date=${dateString}`)
                .then(response => {
                    setAvailableSlots(response.data);
                })
                .catch(error => {
                    console.error("Error fetching available slots:", error);
                    toast.error("Could not load available times.");
                })
                .finally(() => {
                    setSlotsLoading(false);
                });
        }
    }, [doctor, selectedDay, backendUrl]);

    const handleHospitalChange = (e) => {
        const newHospitalId = e.target.value;
        setSelectedHospitalId(newHospitalId);
        const selectedHospital = doctor.hospitals.find(h => h.hospital_id.toString() === newHospitalId);
        if (selectedHospital) {
            setCurrentPrice(selectedHospital.opd_charge);
        }
    };

    const handleBooking = (e) => {
        e.preventDefault();
        if (!token) {
            toast.info("Please log in to book an appointment.");
            navigate('/login');
            return;
        }

        const appointmentData = {
            doctor_id: doctor.id,
            hospital_id: selectedHospitalId,
            day: selectedDay,
            time: selectedTime,
        };

        axios.post(`${backendUrl}book-appointment/`, appointmentData, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            const appointmentId = response.data.appointment_id;
            axios.post(`${backendUrl}initiate-payment/`, { appointment_id: appointmentId }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(paymentResponse => {
                const { esewa_url, form_data } = paymentResponse.data;
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = esewa_url;
                for (const key in form_data) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = form_data[key];
                    form.appendChild(input);
                }
                document.body.appendChild(form);
                form.submit();
            })
            .catch(() => toast.error("Could not initiate payment."));
        })
        .catch(error => {
            toast.error(error.response?.data?.error || "Booking failed.");
        });
    };

    const getDoctorImageUrl = (doc) => {
        if (!doc?.photo) return '/default-doctor.png';
        return doc.photo.startsWith('http') ? doc.photo : `${backendUrl.replace(/\/api\/$/, '')}${doc.photo}`;
    };

    if (loading || !doctor) {
        return <div className="text-center py-20">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden md:flex">
                <div className="md:w-1/3">
                    <img className="w-full h-full object-cover" src={getDoctorImageUrl(doctor)} alt={doctor.name} />
                </div>
                <div className="md:w-2/3 p-6">
                    <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>

                    {/* ❗ KEY FIX: Display the specialty name from the object */}
                    <p className="text-xl text-blue-600 font-semibold mt-1">
                        {doctor.specialty ? doctor.specialty.name : 'General Medicine'}
                    </p>

                    <p className="mt-4 text-gray-700">{doctor.about || 'No detailed information available.'}</p>
                    
                    <div className="mt-6 border-t pt-4">
                        <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                            <span className="text-lg font-semibold text-gray-800">Consultation Fee:</span>
                            <span className="text-xl font-bold text-green-600">
                                {currentPrice ? `Rs. ${currentPrice}` : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Book an Appointment</h3>
                        <form onSubmit={handleBooking} className="space-y-4">
                            <div>
                                <label htmlFor="hospital" className="block text-sm font-medium text-gray-700">Hospital</label>
                                <select id="hospital" value={selectedHospitalId} onChange={handleHospitalChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                    {doctor.hospitals?.map(h => <option key={h.hospital_id} value={h.hospital_id}>{h.hospital_name}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="day" className="block text-sm font-medium text-gray-700">Choose an available day</label>
                                <select id="day" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
                                    <option value="" disabled>Select a day</option>
                                    {doctor.available_days?.map(day => <option key={day} value={day}>{day}</option>)}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="time" className="block text-sm font-medium text-gray-700">Choose an available time</label>
                                <select 
                                    id="time" 
                                    value={selectedTime} 
                                    onChange={(e) => setSelectedTime(e.target.value)} 
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md" 
                                    required
                                    disabled={slotsLoading || availableSlots.length === 0}
                                >
                                    <option value="" disabled>
                                        {slotsLoading ? "Loading times..." : (availableSlots.length === 0 ? "No slots available" : "Select a time")}
                                    </option>
                                    {availableSlots.map(slot => <option key={slot.id} value={slot.time.substring(0, 5)}>{slot.time}</option>)}
                                </select>
                            </div>

                            <button type="submit" disabled={!selectedDay || !selectedTime || !selectedHospitalId} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400">
                                Book and Proceed to Pay
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalAppointment;