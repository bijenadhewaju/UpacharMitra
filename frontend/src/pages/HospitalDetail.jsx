import React, { useEffect, useState } from 'react';
import { Link, useParams, Routes, Route, useLocation } from 'react-router-dom';
import Description from './Description';
import DoctorsBySpeciality from './DoctorsBySpeciality';
import AllDoctors from './AllDoctors';

const HospitalDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const [hospital, setHospital] = useState(null);
    const [doctorsInHospital, setDoctorsInHospital] = useState([]); // State to hold doctors for this hospital
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch hospital details
        fetch(`http://127.0.0.1:8000/api/hospitals/${id}/`)
            .then(res => res.json())
            .then(data => setHospital(data));

        // Fetch doctors for THIS hospital
        fetch(`http://127.0.0.1:8000/api/doctors/?hospital_id=${id}`)
            .then(res => res.json())
            .then(data => {
                setDoctorsInHospital(data);
                setLoading(false);
            });
    }, [id]);

    const getHospitalImageUrl = (hospital) => {
        if (!hospital || !hospital.logo) return '/default-hospital.jpg';
        if (hospital.logo.startsWith('http')) return hospital.logo;
        return `http://127.0.0.1:8000${hospital.logo}`;
    };

    const isActive = (path) => {
        return location.pathname.endsWith(path);
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!hospital) return <div className="text-center py-20">Hospital not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ... (Your existing Hospital Header section) ... */}
            <div className="relative">
                <div className="h-64 w-full"><img src={getHospitalImageUrl(hospital)} alt={hospital.name} className="w-full h-full object-cover" /></div>
                <div className="absolute bottom-0 p-6 bg-gradient-to-t from-black/70 w-full"><h1 className="text-4xl font-bold text-white">{hospital.name}</h1><p className="text-gray-200 mt-2">{hospital.location}</p></div>
            </div>

            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4">
                    <nav className="flex space-x-8">
                        {/* ... (Your existing Link tabs for About, All Doctors, Specialities) ... */}
                        <Link to="" relative="path" className={`py-4 px-1 border-b-2 font-medium text-sm ${isActive(`/hospital/${id}`) ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'}`}>About</Link>
                        <Link to="doctors" relative="path" className={`py-4 px-1 border-b-2 font-medium text-sm ${isActive('doctors') ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'}`}>All Doctors</Link>
                        <Link to="speciality" relative="path" className={`py-4 px-1 border-b-2 font-medium text-sm ${isActive('speciality') ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500'}`}>Specialities</Link>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Routes>
                    <Route index element={<Description hospital={hospital} />} />
                    <Route path="doctors" element={<AllDoctors hospitalId={hospital.id} />} />
                    {/* THIS IS THE KEY CHANGE: Pass the fetched doctors down as a prop */}
                    <Route 
                        path="speciality" 
                        element={<DoctorsBySpeciality doctorsInHospital={doctorsInHospital} />} 
                    />
                </Routes>
            </div>
        </div>
    );
};

export default HospitalDetail;