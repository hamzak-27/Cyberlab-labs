import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Fetch logged-in user using cookie JWT
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/me`, {
        withCredentials: true,
      });
console.log(res,"this is from res authcontext me")
      // EXPECTED RESPONSE: { success, user }
       setUser(res.data || null);

    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    const res = await axios.post(
      "http://localhost:5001/api/auth/login",
      { email, password },
      { withCredentials: true }
    );

    setUser(res.data.user); // backend must send user object
    return res.data.user;
  };

  // Logout function
  const logout = async () => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/logout`,
      {},
      { withCredentials: true }
    );
    console.log("hello")
    setUser(null);
    navigate("/login");
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
