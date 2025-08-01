import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

// --- SVG Icons for a professional look ---
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);


const Hospitals = () => {
    const { backendUrl } = useContext(AppContext);
    const [hospitals, setHospitals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        axios.get(`${backendUrl}hospitals/`)
            .then(response => {
                setHospitals(response.data);
            })
            .catch(error => {
                console.error("Error fetching hospitals:", error);
                toast.error("Could not load the list of hospitals.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [backendUrl]);

    const getImageUrl = (path) => {
        if (!path) return '/default-hospital.png';
        if (path.startsWith('http')) return path;
        const cleanBackendUrl = backendUrl.replace(/\/api\/$/, '');
        return `${cleanBackendUrl}${path}`;
    };

    // Filter hospitals based on the search term for better performance
    const filteredHospitals = useMemo(() => {
        return hospitals.filter(hospital =>
            hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hospital.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [hospitals, searchTerm]);

    if (isLoading) {
        return <div className="text-center py-20">Loading Hospitals...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* --- Header --- */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900">Our Partner Hospitals</h1>
                    <p className="mt-4 text-lg text-gray-600">Find trusted healthcare facilities near you.</p>
                </div>

                {/* --- Search Bar --- */}
                <div className="mb-8 max-w-2xl mx-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by hospital name or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>

                {/* --- Hospitals Grid --- */}
                {filteredHospitals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredHospitals.map(hospital => (
                            <Link to={`/hospital/${hospital.id}`} key={hospital.id} className="group block bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
                                <div className="p-6">
                                    <div className="flex items-center gap-5 mb-4">
                                        <img src={getImageUrl(hospital.logo)} alt={`${hospital.name} Logo`} className="h-20 w-20 object-contain rounded-full border p-1" />
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">{hospital.name}</h2>
                                            <p className="text-sm text-gray-500">{hospital.location}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4 h-16">
                                        {hospital.description ? `${hospital.description.substring(0, 100)}...` : 'Providing excellent healthcare services to the community.'}
                                    </p>
                                    <div className="border-t pt-4 flex justify-between items-center text-green-600 font-semibold">
                                        <span>View Details</span>
                                        <ArrowRightIcon />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <p className="text-xl text-gray-600">No hospitals found.</p>
                        <p className="mt-2 text-gray-500">Try a different search term or check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Hospitals;