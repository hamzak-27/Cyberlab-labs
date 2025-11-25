import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Shield,
  Mail,
  User,
  Lock,
  CheckCircle,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/* ------------------ INVITE SCHEMA --------------------- */
const inviteSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
});

/* ------------------ REGISTER SCHEMA --------------------- */
const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),

    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only include letters, numbers, and underscores"
      ),

    email: z.string().email("Please enter a valid email"),

    password: z.string().min(6, "Password must be at least 6 characters"),

    confirm: z.string().min(6, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords must match",
    path: ["confirm"],
  });

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { fetchUser } = useAuth();


  /* -------- Invite Form -------- */
  const {
    register,
    handleSubmit,
    formState: { errors: inviteErrors },
  } = useForm({
    resolver: zodResolver(inviteSchema),
  });

  /* -------- Register Form -------- */
  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    formState: { errors: formErrors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  /* ✅ Toast only once per validation change (fixes double toast) */
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      const firstError = Object.values(formErrors)[0]?.message;
      if (firstError) toast.error(firstError);
    }
  }, [formErrors]);

  /* ------------------ STEP 1: Check Invite ------------------ */
  const checkInvite = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ STEP 2: Create Account ------------------ */
  const createAccount = async (data) => {
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/sign-up`,
        data,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

     if (response.data.success) {
  toast.success("Account created successfully!");
  await fetchUser(); // ✅ Update global user immediately
  setStep(3);
  return;
}
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ Password Strength Meter ------------------ */
  const passwordStrength = (password) => {
    if (!password) return { strength: 0, label: "Empty", color: "gray" };

    let s = 0;
    if (password.length >= 6) s++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^a-zA-Z\d]/.test(password)) s++;

    const types = [
      { strength: 0, label: "Very Weak", color: "red" },
      { strength: 1, label: "Weak", color: "orange" },
      { strength: 2, label: "Fair", color: "yellow" },
      { strength: 3, label: "Good", color: "blue" },
      { strength: 4, label: "Strong", color: "green" },
    ];

    return types[s];
  };

  const strength = passwordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-4 px-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card gradient={true} className="backdrop-blur-xl border-cyan-500/20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Join CyberLearn
                </h2>
                <p className="text-gray-400 text-sm">
                  Start your cybersecurity journey
                </p>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* ------------------ STEP 1: INVITE ------------------ */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <form className="space-y-6" onSubmit={handleSubmit(checkInvite)}>
                  <Input
                    label="Invite Code"
                    placeholder="Enter invite code"
                    {...register("inviteCode")}
                    error={inviteErrors.inviteCode?.message}
                  />

                  <Button type="submit" loading={loading} className="w-full">
                    Continue →
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ------------------ STEP 2: REGISTER FORM ------------------ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <form
                  className="space-y-6"
                  onSubmit={handleSubmitForm(createAccount)}
                >
                  <Input
                    icon={<User className="w-4 h-4" />}
                    label="Full Name"
                    {...registerForm("fullName")}
                    error={formErrors.fullName?.message}
                  />

                  <Input
                    icon={<User className="w-4 h-4" />}
                    label="Username"
                    {...registerForm("username")}
                    error={formErrors.username?.message}
                  />

                  <Input
                    icon={<Mail className="w-4 h-4" />}
                    label="Email"
                    {...registerForm("email")}
                    error={formErrors.email?.message}
                  />

                  <Input
                    icon={<Lock className="w-4 h-4" />}
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    {...registerForm("password")}
                    error={formErrors.password?.message}
                    endAdornment={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                  />

                  {/* Password strength */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Strength:</span>
                        <span className={`text-${strength.color}-400`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-${strength.color}-500`}
                          style={{ width: `${(strength.strength / 4) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <Input
                    icon={<Lock className="w-4 h-4" />}
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    {...registerForm("confirm")}
                    error={formErrors.confirm?.message}
                    endAdornment={
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                  />

                  <Button type="submit" loading={loading} className="w-full">
                    Create Account
                  </Button>
                   <div className="text-center mt-4">
    <p className="text-gray-400 text-sm">
      Already registered?{" "}
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="text-cyan-400 hover:text-cyan-300 underline"
      >
        Sign In
      </button>
    </p>
  </div>
                </form>
              </motion.div>
            )}

            {/* ------------------ STEP 3: SUCCESS ------------------ */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">
                  Welcome to CyberLearn!
                </h3>

                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full"
                >
                  Go to Dashboard →
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
