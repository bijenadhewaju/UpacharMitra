import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const PrivateRoute = ({ children }) => {
    const { token } = useContext(AppContext);

    // If there's no token, redirect to the login page
    if (!token) {
        return <Navigate to="/login" />;
    }

    // If the token exists, render the child component (e.g., MyAppointments or MyProfile)
    return children;
};

export default PrivateRoute;