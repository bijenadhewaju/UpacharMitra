import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const PaymentSuccess = () => {
    const { backendUrl, token } = useContext(AppContext);
    const navigate = useNavigate();
    const { search } = useLocation();

    useEffect(() => {
        const verifyPayment = async () => {
            const params = new URLSearchParams(search);
            const encodedData = params.get('data');

            if (!encodedData) {
                toast.error("Payment data not found.");
                navigate('/');
                return;
            }

            try {
                // Decode the Base64 response from eSewa
                const decodedData = JSON.parse(atob(encodedData));

                if (decodedData.status !== "COMPLETE") {
                    toast.error("Payment was not completed. Please try again.");
                    navigate('/my-appointments');
                    return;
                }
                
                // Send the transaction details to your backend for verification
                await axios.post(`${backendUrl}verify-payment/`, 
                    { 
                        transaction_uuid: decodedData.transaction_uuid,
                        transaction_code: decodedData.transaction_code,
                    }, 
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                toast.success("Payment successful! Your appointment is confirmed.");
                navigate('/my-appointments');

            } catch (error) {
                console.error("Payment verification failed:", error);
                toast.error(error.response?.data?.error || "Payment verification failed. Please check your appointments.");
                navigate('/my-appointment');
            }
        };

        if (token) {
            verifyPayment();
        } else {
            toast.error("You must be logged in to verify a payment.");
            navigate('/login');
        }
    }, [search, navigate, backendUrl, token]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
            <h1 className="text-2xl font-bold mt-4">Verifying Payment...</h1>
            <p>Please wait while we confirm your transaction.</p>
        </div>
    );
};

export default PaymentSuccess;