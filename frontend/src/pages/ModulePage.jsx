import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Users, Target, ArrowLeft } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import ModulePageCard from "../components/modules/ModulePageCard";
import Card from "../components/ui/Card";
import axios from "axios";
import Button from "../components/ui/Button";

export default function ModulePage() {
  const { courseId: id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  // ✅ Fetch course + modules when id changes
  useEffect(() => {
    fetchCourseAndModules();
  }, [id]);

  const fetchCourseAndModules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5001/api/module/${id}/modules`,
        { withCredentials: true }
      );

      // Assuming backend returns { course, modules }
      setCourse(response.data.course);
      const fetchedModules = response.data.modules || [];

      // Ensure module completion format
      const formattedModules = fetchedModules.map((m) => ({
        ...m,
        completion: m.completion || { content: false, video: false, lab: false },
      }));

      setModules(formattedModules);

      // ✅ Calculate progress
      const completed = formattedModules.filter(
        (m) => m.completion?.content && m.completion?.video && m.completion?.lab
      ).length;

      setProgress({ completed, total: formattedModules.length });
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCourse = () => {
    if (modules.length > 0) {
      const firstModule = modules[0];
      navigate(`/courses/${id}/modules/${firstModule._id}/learn`);
    }
  };

  const handleModuleClick = (module) => {
   
    navigate(`/courses/${id}/${module._id}/learn`);
  };

  if (loading || !course) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <main className="flex-1 p-6 pt-[70px] md:pt-6 md:ml-80 flex items-center justify-center">
          <div className="text-white text-xl">Loading modules...</div>
        </main>
      </div>
    );
  }

  const goBack = ()=>{
    navigate(`/courses`);

  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <main className="flex-1 p-6 pt-[70px] md:pt-6 md:mx-16 overflow-auto">
        {/* Header */}
           <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <Button
                    variant="secondary"
                    icon={<ArrowLeft className="w-4 h-4" />}
                    onClick={goBack}
                    className="mb-4"
                  >
                    Back to Courses
                  </Button>
        
                 
                </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
            <div className="flex-1">
              <motion.h1
                className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {course.title}
              </motion.h1>
              <motion.p
                className="text-gray-400 text-lg mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {course.description}
              </motion.p>

              {/* Progress Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4"
              >
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(progress.completed / progress.total) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-300 whitespace-nowrap">
                  {progress.completed} of {progress.total} modules completed
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 lg:w-2/3">
            <h2 className="text-2xl font-bold text-white mb-6">
              Course Modules
            </h2>
            {modules.map((module,idx) => (
             
              <ModulePageCard
                key={module._id}
                 number={idx}
                module={module}
                courseId={id}
                onProgressUpdate={() => fetchCourseAndModules()}
                onClick={() => handleModuleClick(module)}
                
              />
          
            ))}
          </div>

          <div className="lg:w-1/3 flex-shrink-0">
            <CourseSidebar course={course} progress={progress} />
          </div>
        </div>
      </main>
    </div>
  );
}

// Sidebar component stays the same
function CourseSidebar({ course, progress }) {
  const stats = [
    { label: "Duration", value: course.duration, icon: Clock },
    { label: "Difficulty", value: course.difficulty, icon: Target },
    { label: "Students", value: course.students?.toLocaleString(), icon: Users },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Course Overview</h3>
        <div className="space-y-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300 text-sm">{label}</span>
              </div>
              <span className="text-white text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {Math.round((progress.completed / progress.total) * 100)}%
          </div>
          <div className="text-gray-400 text-sm">
            {progress.completed} of {progress.total} modules
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
