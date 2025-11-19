import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import "./home_page.css";

import Dashboard from "./components/Dashboard";
import Modules from "./components/Modules";
import Paths from "./components/Paths";
import Certificates from "./components/Certificates";
import Badges from "./components/Badges";
import ShadcnDemo from "./components/ShadcnDemo";
import SignupPage from "./pages/SignupPage";
import CourseList from "./components/AddCourse/CourseList";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./lib/PrivateRoute";
import AdminDashboard from "./pages/AdminPages/AdminDashboard";
import axios from "axios";
import HomePage from "./pages/HomePage";
import ModulePage from "./pages/AdminPages/ModulePage";
import LessonPage from "./pages/AdminPages/LessonsPage";
import UserModulePage from "./pages/UserModulePage";
import UserLessonsPage from "./pages/UserLessonsPage";
import Unauthorized from "./pages/AdminPages/Unauthorized";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await axios.get("http://localhost:5001/api/user/me", {
        withCredentials: true,
      });
      setUser(user.data);
    };

    fetchUser();
  }, []);

  return (
    <Router>
      <div className="App ">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/courses/:id/modules"
            element={
              <PrivateRoute allowedRoles={["user", "admin"]}>
                <UserModulePage user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/courses/:id/modules/:moduleId/learn"
            element={
              <PrivateRoute allowedRoles={["user", "admin"]}>
                <UserLessonsPage user={user} />
              </PrivateRoute>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={["user", "admin"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/courses"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/courses/:id/modules"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <ModulePage user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/courses/:id/modules/:moduleId/lessons"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <LessonPage user={user} />{" "}
              </PrivateRoute>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/modules"
            element={
              <PrivateRoute allowedRoles={["user", "admin"]}>
                <Modules />
              </PrivateRoute>
            }
          />
          <Route
            path="/paths"
            element={
              <PrivateRoute allowedRoles={["user", "admin"]}>
                <Paths />
              </PrivateRoute>
            }
          />
          <Route
            path="/certificates"
            element={
              <PrivateRoute allowedRoles={["user", "admin"]}>
                <Certificates />
              </PrivateRoute>
            }
          />
          <Route path="/badges" element={<Badges />} />
          <Route path="/shadcn-demo" element={<ShadcnDemo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
