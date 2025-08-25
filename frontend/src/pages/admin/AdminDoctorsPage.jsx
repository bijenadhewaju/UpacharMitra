import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const AdminDoctorsPage = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [unassignedDoctors, setUnassignedDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form states
    const [newDoctorData, setNewDoctorData] = useState({
        name: '', email: '', specialty: '', fees: '', about: '',
        opd_charge: '', nmc_no: '', password: ''
    });
    const [doctorPhoto, setDoctorPhoto] = useState(null);
    const [existingDoctorData, setExistingDoctorData] = useState({
        doctor_id: '', opd_charge: ''
    });

    useEffect(() => {
        if (token) {
            setIsLoading(true);
            
            // ✅ CORRECTED URLs: Ensured paths are correct relative to backendUrl
            const fetchUnassigned = axios.get(`${backendUrl}admin/unassigned-doctors/`, { headers: { Authorization: `Bearer ${token}` } });
            const fetchSpecialties = axios.get(`${backendUrl}specialties/`, { headers: { Authorization: `Bearer ${token}` } });

            Promise.all([fetchUnassigned, fetchSpecialties])
                .then(([unassignedRes, specialtiesRes]) => {
                    setUnassignedDoctors(unassignedRes.data);
                    setSpecialties(specialtiesRes.data);
                })
                .catch(err => {
                    console.error("Failed to load initial data:", err);
                    toast.error("Could not load necessary data. Please check the console.");
                })
                .finally(() => {
                    // This will now always run, preventing the page from getting stuck
                    setIsLoading(false);
                });
        }
    }, [token, backendUrl]);

    const handleNewDoctorChange = (e) => {
        setNewDoctorData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePhotoChange = (e) => {
        setDoctorPhoto(e.target.files[0]);
    };

    const handleExistingDoctorChange = (e) => {
        setExistingDoctorData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreateDoctorSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(newDoctorData).forEach(key => {
            formData.append(key, newDoctorData[key]);
        });
        if (doctorPhoto) {
            formData.append('photo', doctorPhoto);
        }

        try {
            const response = await axios.post(`${backendUrl}admin/create-doctor/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success(response.data.success);
            // You can add logic here to refresh the lists
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to create doctor.");
        }
    };

    const handleAddExistingDoctorSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${backendUrl}admin/add-existing-doctor/`, existingDoctorData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(response.data.success);
            // Refresh the list of unassigned doctors
            axios.get(`${backendUrl}admin/unassigned-doctors/`, { headers: { Authorization: `Bearer ${token}` } })
                 .then(res => setUnassignedDoctors(res.data));
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to add doctor.");
        }
    };

    if (isLoading) {
        return <div className="text-center py-10">Loading Doctor Management...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Manage Doctors</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create New Doctor Form */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Create New Doctor</h2>
                    <form onSubmit={handleCreateDoctorSubmit} className="space-y-4">
                        <input type="text" name="name" onChange={handleNewDoctorChange} placeholder="Doctor's Full Name" className="w-full p-2 border rounded" required />
                        <input type="email" name="email" onChange={handleNewDoctorChange} placeholder="Doctor's Email" className="w-full p-2 border rounded" required />
                        <input type="text" name="nmc_no" onChange={handleNewDoctorChange} placeholder="NMC Number" className="w-full p-2 border rounded" required />
                        <select name="specialty" onChange={handleNewDoctorChange} className="w-full p-2 border rounded" required>
                            <option value="">Select Specialty</option>
                            {specialties.map(spec => <option key={spec.id} value={spec.id}>{spec.name}</option>)}
                        </select>
                        <input type="password" name="password" onChange={handleNewDoctorChange} placeholder="Temporary Password" className="w-full p-2 border rounded" required />
                        <div>
                            <label htmlFor="photo" className="block text-sm font-medium text-gray-700">Doctor's Photo</label>
                            <input type="file" name="photo" id="photo" onChange={handlePhotoChange} className="mt-1 block w-full text-sm" />
                        </div>
                        <input type="number" name="fees" onChange={handleNewDoctorChange} placeholder="Default Consultation Fee" className="w-full p-2 border rounded" required />
                        <input type="number" name="opd_charge" onChange={handleNewDoctorChange} placeholder="OPD Charge for Your Hospital" className="w-full p-2 border rounded" required />
                        <textarea name="about" onChange={handleNewDoctorChange} placeholder="About the doctor..." className="w-full p-2 border rounded"></textarea>
                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700">Create and Add Doctor</button>
                    </form>
                </div>
                {/* Add Existing Doctor Form */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Add Existing Doctor</h2>
                    <form onSubmit={handleAddExistingDoctorSubmit} className="space-y-4">
                        <select name="doctor_id" onChange={handleExistingDoctorChange} className="w-full p-2 border rounded" required>
                            <option value="">Select an Unassigned Doctor</option>
                            {unassignedDoctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name} - ({doc.specialty})</option>)}
                        </select>
                        <input type="number" name="opd_charge" onChange={handleExistingDoctorChange} placeholder="OPD Charge for Your Hospital" className="w-full p-2 border rounded" required />
                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700">Add to Hospital</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminDoctorsPage;