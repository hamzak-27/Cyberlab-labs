import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function UserModulePage({ user }) {
  const { id } = useParams(); // Course ID
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setCourse(response.data.course);
      setModules(response.data.modules || []);
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
    navigate(`/courses/${id}/modules/${module._id}/learn`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b121f] via-[#141d2b] to-[#0b121f]">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-gray-800/50 bg-[#0b121f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/modules")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Courses
          </button>

          {course && (
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-3">
                  {course.title}
                </h1>
                <p className="text-gray-400 text-lg mb-4">{course.detail}</p>

                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-semibold border border-blue-500/30">
                    {course.type}
                  </span>
                  <span className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg text-sm font-semibold border border-purple-500/30">
                    {course.complexity}
                  </span>
                  <span className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm font-semibold border border-green-500/30">
                    {course.hours} Hours
                  </span>
                  <span className="px-4 py-2 bg-orange-600/20 text-orange-400 rounded-lg text-sm font-semibold border border-orange-500/30">
                    {modules.length} Modules
                  </span>
                </div>
              </div>

              <button
                onClick={handleStartCourse}
                className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden flex-shrink-0"
                disabled={modules.length === 0}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <span className="relative flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Start Course
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Course Modules</h2>
          <p className="text-gray-400">
            Complete modules in order to progress through the course
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Loading modules...</p>
            </div>
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-2xl border border-gray-800/50">
            <p className="text-gray-400">No modules available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((module, index) => {
              const isFirst = index === 0;
              const isLast = index === modules.length - 1;

              return (
                <div key={module._id} className="relative">
                  {/* Connecting line */}
                  {!isLast && (
                    <div className="absolute left-[2.25rem] top-20 w-0.5 h-[calc(100%+1rem)] bg-gradient-to-b from-gray-700 to-transparent z-0"></div>
                  )}

                  <div
                    onClick={() => handleModuleClick(module)}
                    className="group relative bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-2xl border border-gray-800/50 p-6 hover:border-blue-500/50 transition-all hover:transform hover:scale-[1.01] cursor-pointer"
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all"></div>

                    <div className="relative flex items-start gap-6">
                      {/* Module Number Badge */}
                      <div className="relative flex-shrink-0 z-10">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center font-bold text-2xl text-white border-2 border-blue-500/30 group-hover:scale-110 transition-transform">
                          {module.order}
                        </div>
                        {isFirst && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#141d2b]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="text-white"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </div>
                        )}
                        {module.isLocked && (
                          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-[#141d2b]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="2.5"
                            >
                              <rect
                                width="18"
                                height="11"
                                x="3"
                                y="11"
                                rx="2"
                                ry="2"
                              />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Module Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                {module.title}
                              </h3>
                              {isFirst && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold border border-green-500/30">
                                  START HERE
                                </span>
                              )}
                              {module.isLocked && (
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold border border-yellow-500/30">
                                  LOCKED
                                </span>
                              )}
                            </div>

                            {module.description && (
                              <p className="text-gray-400 text-left mb-4">
                                {module.description}
                              </p>
                            )}

                            {/* Stats */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-400">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="m16 6 4 14" />
                                  <path d="M12 6v14" />
                                  <path d="M8 8v12" />
                                  <path d="M4 4v16" />
                                </svg>
                                <span>Lessons</span>
                              </div>

                              {module.unlockCondition && (
                                <>
                                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <circle cx="12" cy="12" r="10" />
                                      <path d="M12 16v-4" />
                                      <path d="M12 8h.01" />
                                    </svg>
                                    {module.unlockCondition}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Action Arrow */}
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-blue-400 group-hover:translate-x-1 transition-transform"
                              >
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Progress bar placeholder */}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserModulePage;
