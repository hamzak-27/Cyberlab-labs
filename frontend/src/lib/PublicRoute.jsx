import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0b121f] text-white">
        Loading...
      </div>
    );
  }

  // If logged in → block login/signup
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

export default PublicRoute;
