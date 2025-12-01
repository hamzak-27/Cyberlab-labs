import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LabsPage from "./pages/LabsPage";
import LabDetailsPage from "./pages/LabDetailsPage";
import toast, { Toaster } from "react-hot-toast";
import Community from "./pages/Community";
import PrivateRoute from "./lib/PrivateRoute";
import ModulesPage from "./pages/ModulePage";
import axios from "axios";
import Coursepage from "./pages/Coursepage";
import { useAuth } from "./context/AuthContext";
import ModuleContentPage from "./pages/ModuleContentPage";
import PublicRoute from "./lib/PublicRoute";

export default function App() {
  const { loading, user } = useAuth(); // ✅ Now works fine because context is available

  if (loading)
    return (
      <div className="text-white text-center mt-20">Loading...</div>
    );
console.log(user)
  return (
    <>
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          style: {
            background: "#0A0F1F",
            color: "#56F6FF",
            border: "1px solid rgba(0,255,255,0.35)",
            borderRadius: "14px",
            padding: "14px 18px",
            boxShadow: "0 0 12px rgba(0,255,255,0.2)",
            fontSize: "15px",
          },
          success: {
            duration: 3500,
            iconTheme: {
              primary: "#00FFC6",
              secondary: "#0A0F1F",
            },
            style: {
              border: "1px solid rgba(0,255,198,0.35)",
              color: "#00F5C8",
              boxShadow: "0 0 12px rgba(0,255,198,0.25)",
            },
          },
          error: {
            duration: 3500,
            iconTheme: {
              primary: "#FF4D4D",
              secondary: "#0A0F1F",
            },
            style: {
              border: "1px solid rgba(255,77,77,0.35)",
              color: "#FF6A6A",
              boxShadow: "0 0 12px rgba(255,77,77,0.25)",
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute> }/>

        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["user", "admin"]}>
              <Dashboard user={user} />
            </PrivateRoute>
          }
        />
        <Route
          path="/courses/:courseId/:moduleId/learn"
          element={
            <PrivateRoute allowedRoles={["user", "admin"]}>
              <ModuleContentPage user={user}/>
            </PrivateRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <PrivateRoute allowedRoles={["user", "admin"]}>
              <Coursepage user={user} />
            </PrivateRoute>
          }
        />
        <Route
          path="/courses/:courseId"
          element={
            <PrivateRoute allowedRoles={["user", "admin"]}>
              <ModulesPage user={user} />
            </PrivateRoute>
          }
        />

        <Route path="/labs" element={ <PrivateRoute allowedRoles={["user", "admin"]}><LabsPage user={user} /></PrivateRoute>} />
        <Route path="/labs/:labId" element={ <PrivateRoute allowedRoles={["user", "admin"]}><LabDetailsPage user={user} /></PrivateRoute>} />
        <Route path="/community" element={ <PrivateRoute allowedRoles={["user", "admin"]}><Community user={user} /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
