import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, Lock, Mail } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext"; // ✅ import Auth context

// ✅ Validation Schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { fetchUser } = useAuth(); // ✅ Fetch and update user globally

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/sign-in",
        data,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // ✅ for cookie-based sessions
        }
      );

      if (response.data.success) {
        toast.success("✅ Login successful! Redirecting...");
        await fetchUser(); // ✅ Update user in context immediately
        navigate("/dashboard");
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      setValue("email", "");
      setValue("password", "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-4 flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(6,182,212,0.1)_25%,rgba(6,182,212,0.1)_26%,transparent_27%,transparent_74%,rgba(6,182,212,0.1)_75%,rgba(6,182,212,0.1)_76%,transparent_77%),linear-gradient(0deg,transparent_24%,rgba(6,182,212,0.1)_25%,rgba(6,182,212,0.1)_26%,transparent_27%,transparent_74%,rgba(6,182,212,0.1)_75%,rgba(6,182,212,0.1)_76%,transparent_77%)] bg-[length:50px_50px] opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card gradient className="backdrop-blur-xl border-cyan-500/20">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  CyberLearn Pro
                </h2>
                <p className="text-gray-400 text-sm">Secure Learning Platform</p>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400">
              Good to see you again — let’s continue your cybersecurity journey!
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <Input
              icon={<Mail className="w-4 h-4" />}
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              {...register("email")}
              error={errors.email?.message}
            />

            {/* Password */}
            <Input
              icon={<Lock className="w-4 h-4" />}
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...register("password")}
              error={errors.password?.message}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              icon="🚀"
              size="lg"
            >
              {loading ? "Signing In..." : "Sign In to Your Account"}
            </Button>

            {/* Register Link */}
            <p className="text-gray-400 text-center">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </form>
        </Card>

        <p className="text-gray-500 text-sm text-center mt-6 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          Your data is securely encrypted and protected
        </p>
      </motion.div>
    </div>
  );
}
