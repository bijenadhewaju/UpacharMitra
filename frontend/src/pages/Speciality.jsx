import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Speciality = () => {
    const { backendUrl } = useContext(AppContext);
    const [specialties, setSpecialties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch the dedicated list of specialties from your new API endpoint
        axios.get(`${backendUrl}specialties/`)
            .then(response => {
                setSpecialties(response.data);
            })
            .catch(error => {
                console.error("Error fetching specialties:", error);
                toast.error("Could not load specialties.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [backendUrl]);

    // Helper to construct the full image URL for icons
    const getIconUrl = (iconPath) => {
        if (!iconPath) {
            // Return a placeholder if no icon is set
            return 'https://via.placeholder.com/100'; 
        }
        // Remove '/api/' if it exists to correctly join the media URL
        const cleanBackendUrl = backendUrl.replace(/\/api\/$/, '');
        return `${cleanBackendUrl}${iconPath}`;
    };

    if (isLoading) {
        return <div className="text-center py-20">Loading Specialties...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <div className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-900">Our Specialties</h1>
                <p className="mt-4 text-lg text-gray-600">Find the right specialist for your needs.</p>
            </div>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {specialties.map(specialty => (
                    // Link to the doctors page, filtering by the specialty name
                    <Link 
                        to={`/doctors/${specialty.name}`} 
                        key={specialty.id} 
                        className="group block p-6 bg-white rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-center"
                    >
                        <img 
                            src={getIconUrl(specialty.icon)} 
                            alt={`${specialty.name} icon`} 
                            className="h-16 w-16 mx-auto mb-4 object-contain"
                        />
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                            {specialty.name}
                        </h3>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Speciality;