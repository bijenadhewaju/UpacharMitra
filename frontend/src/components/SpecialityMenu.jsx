import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

const SpecialityMenu = () => {
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();
    const [specialties, setSpecialties] = useState([]);

    useEffect(() => {
        // Fetches the list of specialties from your backend
        axios.get(`${backendUrl}api/specialties/`)
            .then(response => {
                setSpecialties(response.data);
            })
            .catch(error => {
                console.error("Error fetching specialties for menu:", error);
            });
    }, [backendUrl]);

    // Helper function to construct the full URL for the icon
    const getIconUrl = (iconPath) => {
        if (!iconPath) {
            return 'https://via.placeholder.com/100'; // Fallback
        }
        // Cleans up the URL to prevent double slashes
        const cleanBackendUrl = backendUrl.replace(/\/api\/$/, '');
        return `${cleanBackendUrl}${iconPath}`;
    };

    // Limits the menu to the first 6 specialties
    const visibleSpecialities = specialties.slice(0, 6);

    return (
        <div id='speciality' className='w-full bg-gradient-to-b from-gray-50 to-blue-50 py-20 px-4'>
            <div className='max-w-7xl mx-auto flex flex-col items-center gap-4 text-center'>
                
                {/* --- Section Header --- */}
                <h1 className='text-4xl font-bold text-gray-800 tracking-tight'>
                    Find by Speciality
                </h1>
                <p className='max-w-2xl text-gray-600'>
                    Explore our wide range of medical specialties. Find the right expert for your health needs and book your appointment with confidence.
                </p>
                
                {/* --- Specialty Cards --- */}
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 pt-8 w-full'>
                    {visibleSpecialities.map((item) => (
                        <Link 
                            to={`/doctors/${item.name}`} 
                            onClick={() => window.scrollTo(0, 0)} 
                            className='group flex flex-col items-center justify-center p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl hover:bg-white transition-all duration-300 transform hover:-translate-y-2' 
                            key={item.id}
                        >
                            <img 
                                className='w-20 h-20 mb-3 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300' 
                                src={getIconUrl(item.icon)} 
                                alt={`${item.name} icon`} 
                            />
                            <p className='text-center font-semibold text-gray-700 group-hover:text-blue-600 transition-colors duration-300'>{item.name}</p>
                        </Link>
                    ))}
                </div>

                {/* --- "See All" Button --- */}
                <button 
                    onClick={() => {
                        navigate('/speciality');
                        window.scrollTo(0, 0);
                    }}
                    className='mt-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105'
                >
                    See All Specialities
                </button>
            </div>
        </div>
    );
};

export default SpecialityMenu;