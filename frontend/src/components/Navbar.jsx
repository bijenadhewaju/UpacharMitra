import React, { useContext, useState, Fragment } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { Transition } from '@headlessui/react';
import { toast } from 'react-toastify';

// --- SVG Icons for a professional look ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const AppointmentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
// --- NEW Icon for the Dashboard ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 00-4-4H3V9h2a4 4 0 004-4V3l5 4-5 4v2a4 4 0 004 4h2v2H9z" /></svg>;


const Navbar = () => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { token, setToken, userData, backendUrl } = useContext(AppContext);

    const logout = () => {
        localStorage.removeItem('token');
        setToken('');
        navigate('/');
        toast.info("You have been logged out.");
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
            setShowMenu(false);
        }
    };

    const getProfilePicUrl = () => {
        if (!userData?.profile_pic) return assets.profile_pic;
        if (userData.profile_pic.startsWith('http')) return userData.profile_pic;
        const cleanBackendUrl = backendUrl.replace(/\/api\/$/, '');
        return `${cleanBackendUrl}${userData.profile_pic}`;
    };

    const navLinkClass = ({ isActive }) =>
        `py-4 px-4 rounded-full text-base transition-colors duration-300 ${isActive ? 'bg-green-100 text-green-800 font-semibold' : 'hover:bg-gray-100'}`;

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="container mx-auto px-4 my-4 sm:px-6 lg:px-8 flex items-center justify-between h-24">
                <Link to="/" className="flex-shrink-0">
                    <img className="w-48" src={assets.logo} alt="UpacharMitra Logo" />
                </Link>

                <nav className="hidden lg:flex items-center gap-4 font-medium text-gray-700">
                    <NavLink to="/" className={navLinkClass}>HOME</NavLink>
                    <NavLink to="/hospitals" className={navLinkClass}>HOSPITALS</NavLink>
                    <NavLink to="/doctors" className={navLinkClass}>DOCTORS</NavLink>
                    <NavLink to="/speciality" className={navLinkClass}>SPECIALITIES</NavLink>
                    <NavLink to="/about" className={navLinkClass}>ABOUT</NavLink>
                    <NavLink to="/contact" className={navLinkClass}>CONTACT</NavLink>
                </nav>

                <div className="flex items-center gap-4">
                    <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 border rounded-full px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-green-500 transition-all">
                        <img src={assets.search_icon} alt="Search" className="h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent focus:outline-none w-32"
                        />
                    </form>

                    {token && userData ? (
                        <div className="relative" onMouseLeave={() => setShowProfileDropdown(false)}>
                            <button onMouseEnter={() => setShowProfileDropdown(true)} className="flex items-center gap-2">
                                <img
                                    className="w-12 h-12 rounded-full object-cover border-2 border-green-500 p-0.5"
                                    src={getProfilePicUrl()}
                                    alt="Profile"
                                />
                            </button>
                            <Transition as={Fragment} show={showProfileDropdown} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
                                <div className="absolute top-full right-0 mt-3 w-60 bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5">
                                    <div className="p-2">
                                        <div className="px-3 py-2 border-b">
                                            <p className="font-semibold text-gray-800 truncate">{userData.name || 'User'}</p>
                                            <p className="text-sm text-gray-500 truncate">{userData.email}</p>
                                        </div>
                                        <nav className="mt-2 flex flex-col gap-1">
                                            
                                            {/* ✅ KEY CHANGE: Conditional link for Admins */}
                                            {userData?.is_hospital_admin && (
                                                <Link to="/admin/dashboard" onClick={() => setShowProfileDropdown(false)} className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 font-semibold">
                                                    <DashboardIcon /> Admin Dashboard
                                                </Link>
                                            )}
                                            
                                            <Link to="/my-profile" onClick={() => setShowProfileDropdown(false)} className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"><UserIcon /> My Profile</Link>
                                            <Link to="/myappointments" onClick={() => setShowProfileDropdown(false)} className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"><AppointmentsIcon /> My Appointments</Link>
                                            <button onClick={logout} className="flex items-center w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50 font-medium"><LogoutIcon /> Logout</button>
                                        </nav>
                                    </div>
                                </div>
                            </Transition>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden md:block bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition-colors shadow-md"
                        >
                            Sign In
                        </button>
                    )}

                    <button onClick={() => setShowMenu(true)} className="lg:hidden p-2">
                        <img className="w-7 h-7" src={assets.menu_icon} alt="Menu" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <Transition show={showMenu} as={Fragment}>
                <div className="lg:hidden fixed inset-0 z-50">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setShowMenu(false)} />
                    </Transition.Child>
                    <Transition.Child as={Fragment} enter="transform transition ease-in-out duration-300" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-300" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                        <div className="relative w-80 max-w-full ml-auto h-full bg-white shadow-xl flex flex-col">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h2 className="font-bold text-lg">Menu</h2>
                                <button onClick={() => setShowMenu(false)} className="p-2">
                                    <img src={assets.cross_icon} className="w-6 h-6" alt="Close" />
                                </button>
                            </div>
                            <nav className="flex-grow p-4 flex flex-col gap-2 text-lg">
                                <NavLink to="/" onClick={() => setShowMenu(false)} className={navLinkClass}>HOME</NavLink>
                                <NavLink to="/hospitals" onClick={() => setShowMenu(false)} className={navLinkClass}>HOSPITALS</NavLink>
                                <NavLink to="/doctors" onClick={() => setShowMenu(false)} className={navLinkClass}>DOCTORS</NavLink>
                                <NavLink to="/speciality" onClick={() => setShowMenu(false)} className={navLinkClass}>SPECIALITIES</NavLink>
                                <NavLink to="/about" onClick={() => setShowMenu(false)} className={navLinkClass}>ABOUT</NavLink>
                                <NavLink to="/contact" onClick={() => setShowMenu(false)} className={navLinkClass}>CONTACT</NavLink>
                            </nav>
                            {!token && (
                                <div className="p-4 border-t">
                                    <button onClick={() => { navigate('/login'); setShowMenu(false); }} className="w-full bg-green-600 text-white py-3 rounded-full font-bold hover:bg-green-700 transition-colors">
                                        Sign In
                                    </button>
                                </div>
                            )}
                        </div>
                    </Transition.Child>
                </div>
            </Transition>
        </header>
    );
};

export default Navbar;