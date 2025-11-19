import React, { useState, useEffect, useRef } from "react";
import { z } from "zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import roleCheck from "@/lib/RoleCheck";

function SignupInput() {
  const navigate = useNavigate();
  const [formdata, setFormdata] = useState({
    email: "",
    fullName: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef();
  const fullNameRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();

  const handleKeyDown = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  const userSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    fullName: z
      .string()
      .min(3, { message: "Full name must be at least 3 characters" }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  });

  useEffect(() => {
    const result = userSchema.safeParse(formdata);

    if (result.success) {
      setErrors({});
      setIsValid(true);
    } else {
      if (result?.error?.issues) {
        const fieldErrors = {};
        result.error.issues.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
        setIsValid(false);
      }
    }
  }, [formdata]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormdata({ ...formdata, [name]: value });
    if (!touched[name]) {
      setTouched({ ...touched, [name]: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      email: true,
      fullName: true,
      username: true,
      password: true,
    });

    if (!isValid) return;

    setIsLoading(true);

    try {
      const validatedData = userSchema.parse(formdata);

      const response = await axios.post(
        "http://localhost:5001/api/auth/sign-up",
        validatedData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        if (roleCheck(response.data.data.user?.role)) {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else if (axios.isAxiosError(error)) {
        console.error("API Error:", error.response?.data || error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b121f] via-[#141d2b] to-[#0b121f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl blur-lg opacity-50"></div>
            <div className="relative  p-3 rounded-xl">
              <img
                src="/macksofy_white.png"
                alt={"course image"}
                className="w-full size-7 h-10 object-cover"
              />
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Master Cybersecurity</p>
          </div>
        </div>

        {/* Signup Card */}
        <div className="relative bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-2xl border border-gray-800/50 p-8 shadow-2xl">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>

          <div className="relative">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Create Account
              </h2>
              <p className="text-gray-400 text-sm">
                Join thousands of cybersecurity learners
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    ref={emailRef}
                    id="email"
                    name="email"
                    value={formdata.email}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleKeyDown(e, fullNameRef)}
                    className={`w-full pl-10 pr-4 py-3 bg-[#0b121f] text-white border ${
                      touched.email && errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-700 focus:border-blue-500"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                    placeholder="you@example.com"
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Full Name Field */}
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-300"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    ref={fullNameRef}
                    id="fullName"
                    name="fullName"
                    value={formdata.fullName}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleKeyDown(e, usernameRef)}
                    className={`w-full pl-10 pr-4 py-3 bg-[#0b121f] text-white border ${
                      touched.fullName && errors.fullName
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-700 focus:border-blue-500"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                    placeholder="John Doe"
                  />
                </div>
                {touched.fullName && errors.fullName && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-300"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" x2="19" y1="8" y2="14" />
                      <line x1="22" x2="16" y1="11" y2="11" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    ref={usernameRef}
                    id="username"
                    name="username"
                    value={formdata.username}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                    className={`w-full pl-10 pr-4 py-3 bg-[#0b121f] text-white border ${
                      touched.username && errors.username
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-700 focus:border-blue-500"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                    placeholder="johndoe123"
                  />
                </div>
                {touched.username && errors.username && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    ref={passwordRef}
                    id="password"
                    name="password"
                    value={formdata.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 bg-[#0b121f] text-white border ${
                      touched.password && errors.password
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-700 focus:border-blue-500"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" x2="23" y1="1" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className={`w-full py-3 rounded-lg font-semibold transition-all relative overflow-hidden group ${
                  isValid && !isLoading
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-600/20"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isValid && !isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                )}
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="group-hover:translate-x-1 transition-transform"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 pt-6 border-t border-gray-800/50">
              <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Secure
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                  Protected
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupInput;
