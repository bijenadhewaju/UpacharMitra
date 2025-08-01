import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const TopDoctors = () => {
    const navigate = useNavigate();
    const { doctors, backendUrl } = useContext(AppContext);

    const handleDoctorClick = (doctor) => {
        navigate('/book-appointment', { state: { doctor } });
        window.scrollTo(0, 0);
    };

    // ❗ KEY FIX: Use the same robust function as your working Doctors.jsx page
    const getDoctorImageUrl = (photoPath) => {
        if (!photoPath) {
            return '/default-doctor.png'; // A fallback image
        }
        if (photoPath.startsWith('http')) {
            return photoPath;
        }
        // This correctly removes '/api/' if it exists and builds the full URL
        const cleanBackendUrl = backendUrl.replace(/\/api\/$/, '');
        return `${cleanBackendUrl}${photoPath}`;
    };

    return (
        <div className='flex flex-col items-center gap-6 my-16 text-[#262626] md:mx-10'>
            <h1 className='text-4xl font-bold text-gray-800'>Top Doctors to Book</h1>
            <p className='max-w-xl text-center text-gray-600'>
                Simply browse through our extensive list of trusted doctors, and schedule your appointment hassle-free.
            </p>
            
            <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 pt-5 px-3 sm:px-0'>
                {doctors.slice(0, 10).map((doctor) => (
                    <div 
                        onClick={() => handleDoctorClick(doctor)} 
                        className='group bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300' 
                        key={doctor.id}
                    >
                        <div className="relative">
                            <img 
                                className='w-full h-64 object-cover' 
                                src={getDoctorImageUrl(doctor.photo)} 
                                alt={`Dr. ${doctor.name}`} 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                        <div className='p-4'>
                            <p className='text-lg font-bold text-gray-900'>Dr. {doctor.name}</p>
                            <p className='text-green-700 font-semibold text-sm'>
                                {doctor.specialty ? doctor.specialty.name : 'General Medicine'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={() => { 
                    navigate('/doctors'); 
                    window.scrollTo(0, 0);
                }} 
                className='bg-green-600 text-white font-bold px-12 py-3 rounded-full mt-10 hover:bg-green-700 transition-colors shadow-lg'
            >
                View All Doctors
            </button>
        </div>
    );
};

export default TopDoctors;