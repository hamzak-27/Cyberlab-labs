import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const [auth, setAuth] = useState({
    loading: true,
    success: false,
    role: null,
  });

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/auth/verify", {
          withCredentials: true, // send cookies if using cookie-based auth
        });

        if (res.data.success) {
          setAuth({ loading: false, success: true, role: res.data.user.role });
        } else {
          setAuth({ loading: false, success: false, role: null });
        }
      } catch (error) {
        setAuth({ loading: false, success: false, role: null });
      }
    };

    verifyUser();
  }, []);

  if (auth.loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0b121f] text-white">
        <div className="flex space-x-1 mb-4">
          <div className="w-2 h-6 bg-blue-500 animate-bounce"></div>
          <div className="w-2 h-6 bg-blue-400 animate-bounce delay-100"></div>
          <div className="w-2 h-6 bg-blue-300 animate-bounce delay-200"></div>
        </div>
        <p className="text-gray-300 text-sm tracking-widest uppercase">
          Checking Authentication...
        </p>
      </div>
    );

  // 🚫 Not logged in → redirect
  if (!auth.success) return <Navigate to="/login" />;

  // 🚫 Logged in but not authorized for this route
  if (allowedRoles.length > 0 && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Logged in and authorized
  return children;
};

export default PrivateRoute;
