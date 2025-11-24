import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Users, Target, ArrowLeft } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import ModulePageCard from "../components/modules/ModulePageCard";
import Card from "../components/ui/Card";
import axios from "axios";
import Button from "../components/ui/Button";

export default function ModulePage({user}) {
  const userId = user._id;
  const { courseId: id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [errorProgress, setErrorProgress] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);

  // Fetch course + modules when id changes
  useEffect(() => {
    fetchCourseAndModules();
  }, [id]);

  // Fetch user progress data
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const fetchProgress = async () => {
      setLoadingProgress(true);
      try {
        const res = await axios.get(`http://localhost:5001/api/progress/user/${userId}`, {
          withCredentials: true,
        });

        if (!cancelled) {
          console.log('Fetched progressData:', res.data);
          setProgressData(res.data);
          
          // Find progress for current course
          const currentCourseProgress = res.data.courses?.find(
            c => c.courseId === id
          );
          setCourseProgress(currentCourseProgress);
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
        if (!cancelled) setErrorProgress(err);
      } finally {
        if (!cancelled) setLoadingProgress(false);
      }
    };

    fetchProgress();
    return () => { cancelled = true; };
  }, [userId, id]);

  const fetchCourseAndModules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5001/api/module/${id}/modules`,
        { withCredentials: true }
      );

      setCourse(response.data.course);
      const fetchedModules = response.data.modules || [];

      const formattedModules = fetchedModules.map((m) => ({
        ...m,
        completion: m.completion || { content: false, video: false, lab: false },
      }));

      setModules(formattedModules);

      // Calculate progress from modules
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

  const goBack = () => {
    navigate(`/courses`);
  };

  // Use API progress data if available, otherwise fallback to calculated progress
  const displayProgress = courseProgress || progress;
  const completedModules = courseProgress?.completedModules ?? progress.completed;
  const totalModules = courseProgress?.totalModules ?? progress.total;
  const progressPercentage = courseProgress?.percentage ?? 
    (totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <main className="flex-1 p-3 md:pt-6 md:mx-16 overflow-auto">
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
                      width: `${progressPercentage}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-300 whitespace-nowrap">
                  {completedModules} of {totalModules} modules completed
                </span>
              </motion.div>

              {/* Status Badge */}
              {courseProgress?.status && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-3"
                >
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      courseProgress.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {courseProgress.status === 'completed' ? '✓ Completed' : 'In Progress'}
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 lg:w-2/3">
            <h2 className="text-2xl font-bold text-white mb-6">
              Course Modules
            </h2>
            {modules.map((module, idx) => (
              <ModulePageCard
                key={module._id}
                number={idx}
                module={module}
                courseId={id}
                onProgressUpdate={() => {
                  fetchCourseAndModules();
                  // Refetch progress data as well
                  if (userId) {
                    axios.get(`http://localhost:5001/api/progress/user/${userId}`, {
                      withCredentials: true,
                    }).then(res => {
                      setProgressData(res.data);
                      const updated = res.data.courses?.find(c => c.courseId === id);
                      setCourseProgress(updated);
                    }).catch(err => console.error('Error updating progress:', err));
                  }
                }}
                onClick={() => handleModuleClick(module)}
              />
            ))}
          </div>

          <div className="lg:w-1/3 flex-shrink-0">
            <CourseSidebar 
              course={course} 
              courseProgress={courseProgress}
              completedModules={completedModules}
              totalModules={totalModules}
              progressPercentage={progressPercentage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function CourseSidebar({ course, courseProgress, completedModules, totalModules, progressPercentage }) {
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
            {progressPercentage}%
          </div>
          <div className="text-gray-400 text-sm">
            {completedModules} of {totalModules} modules
          </div>
          
          {courseProgress?.lastAccessed && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                Last accessed: {new Date(courseProgress.lastAccessed).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}