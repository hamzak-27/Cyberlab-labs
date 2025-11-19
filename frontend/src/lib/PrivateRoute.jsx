import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  console.log(children)

  if (loading) {
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
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;

  return children;
};

export default PrivateRoute;
