import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useContext } from 'react';
import { toast } from 'react-toastify';

// --- Icons for the sidebar ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const AppointmentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const DoctorsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

const AdminLayout = () => {
    const navigate = useNavigate();
    const { setToken } = useContext(AppContext);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken('');
        toast.info("You have been logged out.");
        navigate('/');
    };
    
    const navLinkClass = ({ isActive }) =>
      `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
        isActive ? 'bg-green-600 text-white font-semibold' : 'hover:bg-gray-700'
      }`;

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-gray-200 flex flex-col">
                <div className="p-6 text-center border-b border-gray-700">
                    <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    <NavLink to="/admin/dashboard" className={navLinkClass}>
                        <DashboardIcon />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/appointments" className={navLinkClass}>
                        <AppointmentsIcon />
                        <span>Appointments</span>
                    </NavLink>
                    {/* ✅ ADD THIS NEW LINK */}
                    <NavLink to="/admin/doctors" className={navLinkClass}>
                        <DoctorsIcon />
                        <span>Doctors</span>
                    </NavLink>
                    <NavLink to="/admin/doctors-manage" className={navLinkClass}>
    <DoctorsIcon />
    <span>Manage Doctors</span>
</NavLink>
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <button onClick={handleLogout} className="flex items-center gap-4 w-full px-4 py-3 rounded-lg hover:bg-red-800 transition-colors text-red-300">
                        <LogoutIcon />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-10">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;