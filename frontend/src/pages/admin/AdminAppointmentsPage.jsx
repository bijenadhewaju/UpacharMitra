import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const AdminAppointmentsPage = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [filters, setFilters] = useState({ doctor_id: '', status: '', payment_status: '' });
    const [isLoading, setIsLoading] = useState(true);

    const fetchAppointments = (filterParams) => {
        const params = new URLSearchParams(filterParams).toString();
        // ✅ CORRECTED URL
        axios.get(`${backendUrl}admin/all-appointments/?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setAppointments(response.data))
        .catch(err => toast.error("Failed to fetch appointments."));
    };
    
    useEffect(() => {
        if (token) {
            setIsLoading(true);
            // ✅ CORRECTED URLs
            const initialAppointments = axios.get(`${backendUrl}admin/all-appointments/`, { headers: { Authorization: `Bearer ${token}` } });
            const fetchDoctors = axios.get(`${backendUrl}doctors/`, { headers: { Authorization: `Bearer ${token}` } });

            Promise.all([initialAppointments, fetchDoctors])
                .then(([appointmentsRes, doctorsRes]) => {
                    setAppointments(appointmentsRes.data);
                    setDoctors(doctorsRes.data);
                })
                .catch(err => toast.error("Could not load initial data."))
                .finally(() => setIsLoading(false));
        }
    }, [token, backendUrl]);
    
    useEffect(() => {
        if (!isLoading) {
            fetchAppointments(filters);
        }
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            // ✅ CORRECTED URL
            await axios.post(`${backendUrl}admin/update-appointment-status/`, 
                { appointment_id: appointmentId, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setAppointments(prevAppointments => 
                prevAppointments.map(app => 
                    app.id === appointmentId ? { ...app, status: newStatus } : app
                )
            );
            toast.success("Appointment status updated!");

        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error(error.response?.data?.error || "Could not update status.");
        }
    };
    
    const formatDateTime = (dateTimeStr) => new Date(dateTimeStr).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    if (isLoading) {
        return <div className="text-center py-10">Loading Appointments...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Appointments</h1>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm">
                 <select name="doctor_id" value={filters.doctor_id} onChange={handleFilterChange} className="p-2 border rounded-md">
                    <option value="">All Doctors</option>
                    {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                </select>
                <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border rounded-md">
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="booked">Booked</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                </select>
                <select name="payment_status" value={filters.payment_status} onChange={handleFilterChange} className="p-2 border rounded-md">
                    <option value="">All Payment Statuses</option>
                    <option value="true">Paid</option>
                    <option value="false">Unpaid</option>
                </select>
            </div>

            {/* Appointments Table */}
            {/* --- Appointments Table --- */}
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map(app => (
                            <tr key={app.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{app.patient.first_name} {app.patient.last_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{app.doctor.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{formatDateTime(app.appointment_datetime)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{app.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{app.payment_status ? 'Paid' : 'Unpaid'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select 
                                        value={app.status} 
                                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                        className="p-2 border rounded-md bg-gray-50"
                                    >
                                        <option value="booked">Booked</option>
                                        <option value="completed">Completed</option>
                                        <option value="canceled">Canceled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAppointmentsPage;