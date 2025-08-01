import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "Rs.";

  // Read backend URL from env and ensure trailing slash
  let backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  if (!backendUrl.endsWith("/")) {
    backendUrl += "/";
  }

  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [token, setTokenState] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [loading, setLoading] = useState(true);

  // Function to check if JWT token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;

    try {
      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) return true;

      const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      if (!payload.exp) return true;

      const now = Math.floor(Date.now() / 1000);
      return now >= payload.exp;
    } catch (e) {
      return true;
    }
  };

  // Set token in both localStorage and state
  const setToken = (newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUserData(null);
    }
    setTokenState(newToken);
  };

  // Logout globally
  const logout = () => {
    setToken("");
    toast.info("Logged out successfully");
  };

  // Load all doctors
  const getDoctorsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}doctors/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDoctors(response.data);
    } catch (error) {
      console.error("Error loading doctors:", error);
      toast.error(error.response?.data?.message || "Error fetching doctors");
    }
  };

  // Load all hospitals
  const getHospitalsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}hospitals/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHospitals(response.data);
    } catch (error) {
      console.error("Error loading hospitals:", error);
      toast.error("Error fetching hospitals");
    }
  };

  // Load user profile
  const loadUserProfileData = async (tokenOverride = null) => {
    const finalToken = tokenOverride || token;
    if (!finalToken) return;

    try {
      const response = await axios.get(`${backendUrl}user/profile/`, {
        headers: {
          Authorization: `Bearer ${finalToken}`,
        },
      });

      if (response.data.success && response.data.userData) {
        let user = response.data.userData;

        // Ensure profile_pic is an absolute URL
        if (user.profile_pic && !user.profile_pic.startsWith("http")) {
          const baseUrl = backendUrl.endsWith("/")
            ? backendUrl
            : backendUrl + "/";
          user.profile_pic = baseUrl + user.profile_pic.replace(/^\/+/, "");
        }

        setUserData(user);
      } else {
        throw new Error("Invalid user profile response");
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      logout();
      toast.error("Session expired. Please log in again.");
    }
  };

  // Auto-fetch on mount or token change, with expiry check
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      if (token) {
        // Check if token expired
        if (isTokenExpired(token)) {
          // toast.info("Session expired. Please log in again.");
          logout();
          setLoading(false);
          return;
        }

        await Promise.all([
          loadUserProfileData(),
          getDoctorsData(),
          getHospitalsData(),
        ]);
      } else {
        setUserData(null);
        setDoctors([]);
        setHospitals([]);
      }

      setLoading(false);
    };

    fetchData();
  }, [token]);

  const value = {
    currencySymbol,
    backendUrl,
    token,
    setToken,
    isLoggedIn,
    loading,
    logout,
    userData,
    setUserData,
    loadUserProfileData,
    doctors,
    getDoctorsData,
    hospitals,
    getHospitalsData,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
