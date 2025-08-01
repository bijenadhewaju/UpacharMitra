import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const AdminPrivateRoute = () => {
    const { token, userData, loading } = useContext(AppContext);

    // If the context is still loading user data, show a loading message.
    if (loading) {
        return <div className="text-center py-20">Authenticating Admin...</div>;
    }

    // Check for a token and that the user is specifically a hospital admin.
    if (token && userData?.is_hospital_admin) {
        return <Outlet />; // Render the nested admin pages (e.g., AdminLayout)
    } else {
        // If not an admin, show an error and redirect to the home page.
        toast.error("You are not authorized to access the admin panel.");
        return <Navigate to="/" replace />;
    }
};

export default AdminPrivateRoute;