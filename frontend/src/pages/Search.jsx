import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Search = () => {
    const { backendUrl } = useContext(AppContext);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('query');

    const [results, setResults] = useState({ doctors: [], hospitals: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (query) {
            setIsLoading(true);
            axios.get(`${backendUrl}search/?query=${query}`)
                .then(response => setResults(response.data))
                .catch(error => {
                    console.error("Search failed:", error);
                    toast.error("An error occurred during search.");
                })
                .finally(() => setIsLoading(false));
        }
    }, [query, backendUrl]);

    const getImageUrl = (path) => {
        if (!path) return '/default-doctor.png';
        if (path.startsWith('http')) return path;
        const cleanBackendUrl = backendUrl.replace(/\/api\/$/, '');
        return `${cleanBackendUrl}${path}`;
    };

    if (isLoading) {
        return <div className="text-center py-20 text-lg">Searching for "{query}"...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Results for "{query}"</h1>
            <p className="text-gray-600 mb-8">
                Found {results.doctors.length} doctor(s) and {results.hospitals.length} hospital(s).
            </p>

            {results.doctors.length === 0 && results.hospitals.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                    <p className="text-xl text-gray-600">No results found.</p>
                    <p className="mt-2 text-gray-500">Please try a different search term.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {results.doctors.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-gray-700 mb-6 border-b pb-2">Doctors</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {results.doctors.map(doctor => (
                                    <div key={doctor.id} className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:-translate-y-2 transition duration-300">
                                        <img src={getImageUrl(doctor.photo)} alt={`Dr. ${doctor.name}`} className="w-full h-56 object-cover" />
                                        <div className="p-4">
                                            <h3 className="text-xl font-bold text-gray-900">Dr. {doctor.name}</h3>
                                            <p className="text-md text-green-600 font-semibold">{doctor.specialty.name}</p>
                                            <button onClick={() => navigate('/book-appointment', { state: { doctor } })} className="mt-4 w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition">
                                                Book Appointment
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                    {results.hospitals.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-gray-700 mb-6 border-b pb-2">Hospitals</h2>
                            <div className="space-y-4">
                                {results.hospitals.map(hospital => (
                                    <Link to={`/hospital/${hospital.id}`} key={hospital.id} className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
                                        <h3 className="text-xl font-semibold text-gray-800">{hospital.name}</h3>
                                        <p className="text-gray-600">{hospital.location}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;