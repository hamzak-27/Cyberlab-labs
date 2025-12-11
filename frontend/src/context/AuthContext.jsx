// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

// You can also move this to a separate config file if you want
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const isAuthenticated = !!user;

  // 🔹 Fetch logged-in user using cookie JWT
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_BASE}/user/me`, {
        withCredentials: true,
      });

      console.log("fetchUser /me response:", res.data);

      // Expecting backend to return either:
      // { user: {...} }  OR  just { ...userFields }
      const userData = res.data.user || res.data || null;

      setUser(userData);
    } catch (err) {
      console.error("Error in fetchUser:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // 🔹 Login function
  const login = async (email, password) => {
    const res = await axios.post(
      `${API_BASE}/auth/login`,
      { email, password },
      { withCredentials: true }
    );

    console.log("login response:", res.data);

    // Again, assuming { user: {...} }
    setUser(res.data.user || null);
    return res.data.user;
  };

  // 🔹 Logout function
  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated,
        login,
        logout,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
