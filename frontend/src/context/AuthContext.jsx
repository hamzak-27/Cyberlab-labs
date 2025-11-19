import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch current user (cookie-based)
  const fetchUser = async () => {
    try {
     const res = await axios.get("http://localhost:5001/api/user/me", {
        withCredentials: true,
      });
      setUser(res.data); 
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ Handle login
  const login = async (email, password) => {
    const res = await axios.post(
      "http://localhost:5001/api/auth/login",
      { email, password },
      { withCredentials: true }
    );
    setUser(res.data.user);
  };

  // ✅ Handle logout
  const logout = async () => {
    await axios.post("http://localhost:5001/api/auth/logout", {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
