import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "@/components/NavBar/NavBar";
import LessonList from "@/components/AddLesson/LessonList";
import LessonPreview from "@/components/AddLesson/LessonPreview";
import LessonForm from "@/components/AddLesson/LessonForm";
// import LessonList from "@/components/Lesson/LessonList";
// import LessonForm from "@/components/Lesson/LessonForm";
// import LessonPreview from "@/components/Lesson/LessonPreview";

function LessonPage({ user }) {
  const { id, moduleId } = useParams(); // id = courseId, moduleId = moduleId
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchModuleAndLessons();
  }, [moduleId]);

  const fetchModuleAndLessons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5001/api/lesson/${moduleId}/lessons`,
        { withCredentials: true }
      );
    
    // DEBUG: inspect response shape
    console.log("API response:", response.data);

    // Normalize lessons to always be an array
    let lessonsData = response.data.lessons;
    if (!lessonsData) lessonsData = [];
    else if (!Array.isArray(lessonsData)) lessonsData = [lessonsData];

    setModule(response.data.module || null);
    setLessons(lessonsData);

    // Select the first lesson if exists
    if (lessonsData.length > 0) {
      setSelectedLesson(lessonsData[0]);
    } else {
      setSelectedLesson(null);
    }
  }  catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonCreated = () => {
    fetchModuleAndLessons();
    setIsFormOpen(false);
  };

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
  };

useEffect(() => {
  console.log("Lessons updated:", lessons);
}, [lessons]);
  return (
    <div className="bg-[#0b121f] min-h-screen flex flex-col">
      <NavBar user={user} />

      {/* Top Navigation Bar */}
      <div className="fixed top-16 left-0 right-0 bg-[#141d2b] border-b border-gray-700 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/admin/courses/${id}/modules`)}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
            >
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
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to Modules
            </button>

            {module && (
              <div className="flex items-center gap-3">
                <div className="w-px h-6 bg-gray-700"></div>
                <div>
                  <p className="text-xs text-gray-500">Current Module</p>
                  <p className="text-sm font-semibold text-white">
                    {module.title}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-500/30 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-400"
              >
                <path d="m16 6 4 14" />
                <path d="M12 6v14" />
                <path d="M8 8v12" />
                <path d="M4 4v16" />
              </svg>
              <span className="text-sm text-blue-400 font-medium">Lessons</span>
            </div>
            {selectedLesson == null && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all shadow-lg shadow-blue-600/20"
              >
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
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Add Lesson
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-32 pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Loading lessons...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-12 gap-6">
              {/* Lesson List Sidebar */}
              <div className="col-span-12 lg:col-span-4">
                {/* <LessonList
                  lessons={lessons}
                  selectedLesson={selectedLesson}
                  onLessonSelect={handleLessonSelect}
                /> */}
              </div>

              {/* Lesson Preview */}
              <div className="col-span-12 mt-2">
                {selectedLesson ? (
                  <LessonPreview lesson={selectedLesson} />
                ) : (
                  <div className="bg-gradient-to-br from-[#141d2b] to-[#0f1621] rounded-2xl border border-gray-700/50 p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <defs>
                          <linearGradient
                            id="gradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                        <path d="m16 6 4 14" />
                        <path d="M12 6v14" />
                        <path d="M8 8v12" />
                        <path d="M4 4v16" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      No Lessons Yet
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Create your first lesson to get started
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Form Modal */}
      <LessonForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        moduleId={moduleId}
        onLessonCreated={handleLessonCreated}
        existingLessonsCount={lessons.length}
      />
    </div>
  );
}

export default LessonPage;
