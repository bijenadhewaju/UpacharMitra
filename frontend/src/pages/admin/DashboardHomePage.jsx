import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import DoctorDistributionChart from '../../components/charts/DoctorDistributionChart';
import StatusBreakdownChart from '../../components/charts/StatusBreakdownChart';

const DashboardHomePage = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            setIsLoading(true);
            
            // ✅ CORRECTED URLs: Removed the extra 'api/' prefix
            const fetchStats = axios.get(`${backendUrl}admin/dashboard-stats/`, { headers: { Authorization: `Bearer ${token}` } });
            const fetchCharts = axios.get(`${backendUrl}admin/dashboard-charts/`, { headers: { Authorization: `Bearer ${token}` } });

            Promise.all([fetchStats, fetchCharts])
                .then(([statsRes, chartsRes]) => {
                    setStats(statsRes.data);
                    setChartData(chartsRes.data);
                })
                .catch(error => {
                    console.error("Failed to fetch dashboard data:", error);
                    toast.error("Could not load dashboard data.");
                })
                .finally(() => setIsLoading(false));
        }
    }, [token, backendUrl]);

    if (isLoading || !stats) {
        return <div className="text-center text-lg">Loading Dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome to the {stats.hospital_name} Dashboard</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500">Today's Appointments</h3>
                    <p className="text-4xl font-bold text-blue-600">{stats.todays_appointments_count}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500">Upcoming (Next 7 Days)</h3>
                    <p className="text-4xl font-bold text-purple-600">{stats.upcoming_appointments_count}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500">Today's Revenue</h3>
                    <p className="text-4xl font-bold text-green-600">Rs. {stats.todays_revenue}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-gray-500">Pending Payments</h3>
                    <p className="text-4xl font-bold text-yellow-600">{stats.pending_payments_count}</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {chartData?.appointments_by_doctor?.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <DoctorDistributionChart chartData={chartData.appointments_by_doctor} />
                    </div>
                )}
                {chartData?.appointments_by_status?.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <StatusBreakdownChart chartData={chartData.appointments_by_status} />
                    </div>
                )}
            </div>

            {/* Today's Schedule */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Today's Schedule</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stats.todays_schedule.length > 0 ? stats.todays_schedule.map(app => (
                                <tr key={app.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(app.appointment_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{app.patient.first_name} {app.patient.last_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{app.doctor.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${app.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No appointments scheduled for today.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardHomePage;