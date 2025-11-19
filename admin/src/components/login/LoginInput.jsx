import React, { useState, useEffect, useRef } from "react";
import { z } from "zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import roleCheck from "@/lib/RoleCheck";

function LoginInput() {
  const navigate = useNavigate();
  const [formdata, setFormdata] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef();
  const passwordRef = useRef();

  const handleKeyDown = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  const userSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
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
      const fieldErrors = {};
      result.error?.issues?.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      setIsValid(false);
    }
  }, [formdata]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormdata({ ...formdata, [name]: value });
    if (!touched[name]) setTouched({ ...touched, [name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!isValid) return;
    setIsLoading(true);

    try {
      const validatedData = userSchema.parse(formdata);
      const response = await axios.post(
        "http://localhost:5001/api/auth/sign-in",
        validatedData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log(response.data,"is this couse of error")
      if (response.data.success) {
        if (response.data.user?.role == "admin")
          navigate("/admin/courses");
        else navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
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
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img
            src="/macksofy_white.png"
            alt={"course image"}
            className=" size-32 h-10 object-cover"
          />
          <p className="text-gray-400 text-sm">Welcome Back</p>
        </div>

        <div className="relative bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-2xl border border-gray-800/50 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>

          <div className="relative">
            <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
            <p className="text-gray-400 text-sm mb-8">
              Enter your credentials to access your dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-gray-300">
                  Email
                </label>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  value={formdata.email}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                  className={`w-full pl-3 pr-4 py-3 bg-[#0b121f] text-white border ${
                    touched.email && errors.email
                      ? "border-red-500"
                      : "border-gray-700 focus:border-blue-500"
                  } rounded-lg focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="you@example.com"
                />
                {touched.email && errors.email && (
                  <p className="text-red-400 text-xs">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formdata.password}
                    onChange={handleInputChange}
                    className={`w-full pl-3 pr-10 py-3 bg-[#0b121f] text-white border ${
                      touched.password && errors.password
                        ? "border-red-500"
                        : "border-gray-700 focus:border-blue-500"
                    } rounded-lg focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-red-400 text-xs">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  isValid && !isLoading
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              Don’t have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                Create one
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginInput;
