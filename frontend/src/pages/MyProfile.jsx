import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const MyProfile = () => {
    const { userData, token, backendUrl, loadUserProfileData } = useContext(AppContext);
    const [formData, setFormData] = useState({
        phone: '',
        address: '',
        gender: '',
        birthday: '',
    });
    const [profilePic, setProfilePic] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setFormData({
                phone: userData.phone || '',
                address: userData.address || '',
                gender: userData.gender || '',
                birthday: userData.birthday || '',
            });
        }
    }, [userData]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setProfilePic(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const submissionData = new FormData();
        submissionData.append('phone', formData.phone);
        submissionData.append('address', formData.address);
        submissionData.append('gender', formData.gender);
        submissionData.append('birthday', formData.birthday);
        if (profilePic) {
            submissionData.append('profile_pic', profilePic);
        }

        try {
            await axios.put(`${backendUrl}user/profile/`, submissionData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("Profile updated successfully!");
            // Refresh user data in the context to show changes
            await loadUserProfileData(token);
        } catch (error) {
            console.error("Profile update failed:", error);
            toast.error("Failed to update profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!userData) {
        return <div className="text-center py-20">Loading profile...</div>;
    }

    const getProfilePicUrl = () => {
        if (!userData?.profile_pic) return '/default-profile.png';
        if (userData.profile_pic.startsWith('http')) return userData.profile_pic;
        const cleanBackendUrl = backendUrl.replace(/\/api\/$/, '');
        return `${cleanBackendUrl}${userData.profile_pic}`;
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">My Profile</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div className="flex items-center space-x-6">
                    <img src={getProfilePicUrl()} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
                        <p className="text-gray-600">{userData.email}</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Update Profile Picture</label>
                    <input type="file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">Birthday</label>
                        <input type="date" name="birthday" id="birthday" value={formData.birthday} onChange={handleInputChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-md"/>
                    </div>
                </div>

                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea name="address" id="address" value={formData.address} onChange={handleInputChange} rows="3" className="mt-1 block w-full p-3 border border-gray-300 rounded-md"></textarea>
                </div>
                
                <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default MyProfile;