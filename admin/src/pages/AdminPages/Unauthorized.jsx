// Unauthorized.jsx
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b121f] text-white relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 blur-3xl"></div>

      {/* Lock Icon */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-blue-400 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6a4.5 4.5 0 00-9 0v4.5m-.75 3.75h10.5a.75.75 0 01.75.75v6.75a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75v-6.75a.75.75 0 01.75-.75z"
            />
          </svg>
        </div>

        {/* Text */}
        <h1 className="text-3xl font-bold mt-6 text-blue-400">Access Denied</h1>
        <p className="text-gray-400 mt-2 text-center max-w-md">
          You don’t have permission to view this page.
          <br />
          Please login with the correct account or return to home.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md shadow-blue-500/30"
          >
            Go to Login
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* Animated background lines */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-pulse"></div>
        <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent animate-pulse delay-300"></div>
      </div>
    </div>
  );
}
