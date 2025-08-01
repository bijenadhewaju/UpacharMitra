import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { backendUrl, setToken, token, userData, loadUserProfileData } = useContext(AppContext);
    const navigate = useNavigate();

    const [currentState, setCurrentState] = useState('Login');
    const [data, setData] = useState({ name: "", email: "", password: "", otp: "" });
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleLogin = async () => {
        const endpoint = `${backendUrl}user/login/`;
        try {
            const response = await axios.post(endpoint, {
                email: data.email,
                password: data.password,
            });

            if (response.data.success) {
                const token = response.data.token;
                setToken(token);
                const userProfile = await loadUserProfileData(token);
                toast.success("Logged in successfully!");

                if (userProfile?.is_hospital_admin) {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed.");
        }
    };

    const handleSendOtp = async () => {
        const endpoint = `${backendUrl}user/register/`;
        try {
            const response = await axios.post(endpoint, {
                name: data.name,
                email: data.email,
                password: data.password,
            });

            if (response.data.success) {
                toast.info(response.data.message);
                setOtpSent(true);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP.");
        }
    };

    const handleVerifyOtp = async () => {
        const endpoint = `${backendUrl}user/verify-otp/`;
        try {
            const response = await axios.post(endpoint, {
                email: data.email,
                otp: data.otp,
            });

            if (response.data.success) {
                setToken(response.data.token);
                await loadUserProfileData(response.data.token);
                toast.success("Account created successfully!");
                navigate('/');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "OTP verification failed.");
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (currentState === 'Login') {
            await handleLogin();
        } else {
            if (otpSent) {
                await handleVerifyOtp();
            } else {
                await handleSendOtp();
            }
        }

        setLoading(false);
    };

    // Auto-redirect if already logged in
    useEffect(() => {
        if (token && userData) {
            toast.info("You are already logged in.");
            if (userData.is_hospital_admin) {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [token, userData, navigate]);

    return (
        <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
            <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
                <p className="text-2xl font-semibold">
                    {currentState}
                </p>
                <p>Please {currentState === 'Sign Up' ? 'sign up' : 'log in'} to book an appointment</p>

                {/* Sign Up name input */}
                {currentState === 'Sign Up' && !otpSent && (
                    <div className="w-full">
                        <p>Full Name</p>
                        <input
                            type="text"
                            name="name"
                            required
                            value={data.name}
                            onChange={onChangeHandler}
                            className="border border-[#DADADA] rounded w-full p-2 mt-1"
                            placeholder="Your full name"
                        />
                    </div>
                )}

                {/* Email & Password inputs (if not OTP step) */}
                {!otpSent && (
                    <>
                        <div className="w-full">
                            <p>Email</p>
                            <input
                                type="email"
                                name="email"
                                required
                                value={data.email}
                                onChange={onChangeHandler}
                                className="border border-[#DADADA] rounded w-full p-2 mt-1"
                                placeholder="email@example.com"
                            />
                        </div>
                        <div className="w-full">
                            <p>Password</p>
                            <input
                                type="password"
                                name="password"
                                required
                                value={data.password}
                                onChange={onChangeHandler}
                                className="border border-[#DADADA] rounded w-full p-2 mt-1"
                                placeholder="Your password"
                            />
                        </div>
                    </>
                )}

                {/* OTP input field */}
                {currentState === 'Sign Up' && otpSent && (
                    <div className="w-full">
                        <p className="mb-2 text-center">
                            An OTP has been sent to <strong>{data.email}</strong>.
                        </p>
                        <p>Enter OTP</p>
                        <input
                            type="text"
                            name="otp"
                            required
                            value={data.otp}
                            onChange={onChangeHandler}
                            className="border border-[#DADADA] rounded w-full p-2 mt-1"
                            placeholder="6-digit code"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white w-full py-2 my-2 rounded-md text-base disabled:bg-gray-400"
                >
                    {loading ? 'Processing...' : (
                        currentState === 'Login' ? 'Login' :
                            (otpSent ? 'Verify & Create Account' : 'Send OTP')
                    )}
                </button>

                {currentState === 'Login' ? (
                    <p>
                        Create a new account?{' '}
                        <span
                            onClick={() => {
                                setCurrentState('Sign Up');
                                setOtpSent(false);
                            }}
                            className="text-primary underline cursor-pointer"
                        >
                            Click here
                        </span>
                    </p>
                ) : (
                    <p>
                        Already have an account?{' '}
                        <span
                            onClick={() => setCurrentState('Login')}
                            className="text-primary underline cursor-pointer"
                        >
                            Login here
                        </span>
                    </p>
                )}
            </div>
        </form>
    );
};

export default Login;
