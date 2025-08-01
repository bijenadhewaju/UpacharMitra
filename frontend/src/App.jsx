import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Component Imports ---
import Navbar from "./components/Navbar";
import ChatWidget from "./components/ChatWidget";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import AdminPrivateRoute from "./components/AdminPrivateRoute"; // Import the correct admin route

// --- Page Imports ---
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Verify from "./pages/Verify";
import Hospitals from "./pages/Hospitals";
import Search from "./pages/Search";
import Speciality from "./pages/Speciality";
import HospitalDetail from "./pages/HospitalDetail";
import HospitalAppointment from "./pages/HospitalAppointment";
import PaymentSuccess from "./pages/PaymentSuccess";
import MyAppointments from "./pages/MyAppointments";
import MyProfile from "./pages/MyProfile";

// --- Admin Page Imports ---
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardHomePage from "./pages/admin/DashboardHomePage";
import AdminAppointmentsPage from "./pages/admin/AdminAppointmentsPage"; // Make sure this is imported
import AdminDoctorsPage from "./pages/admin/AdminDoctorsPage";
import AdminManageDoctorsPage from "./pages/admin/AdminManageDoctorsPage"; // ✅ ADD THIS
import AdminDoctorSchedulePage from "./pages/admin/AdminDoctorSchedulePage"
const App = () => {
  return (
    <>
      <Navbar />
      <ChatWidget />

      <div className="p-4">
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/search" element={<Search />} />
          
          {/* --- Doctor & Hospital Routes --- */}
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:speciality" element={<Doctors />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/hospital/:id/*" element={<HospitalDetail />} />
          <Route path="/speciality" element={<Speciality />} />
          <Route path="/book-appointment" element={<HospitalAppointment />} />

          {/* --- Payment Flow Routes --- */}
          <Route path="/payment-success" element={<PaymentSuccess />} />

          {/* --- Private User Routes --- */}
          <Route path="/myappointments" element={<PrivateRoute><MyAppointments /></PrivateRoute>} />
          <Route path="/my-profile" element={<PrivateRoute><MyProfile /></PrivateRoute>} />

          {/* --- Protected Admin Routes --- */}
          <Route element={<AdminPrivateRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<DashboardHomePage />} />
              <Route path="appointments" element={<AdminAppointmentsPage />} />
              <Route path="doctors" element={<AdminDoctorsPage />} />
              <Route path="doctors-manage" element={<AdminManageDoctorsPage />} />
              <Route path="doctors/:doctorId/schedule" element={<AdminDoctorSchedulePage />} />
            </Route>
          </Route>
        </Routes>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
      <Footer/>
    </>
  );
};

export default App;