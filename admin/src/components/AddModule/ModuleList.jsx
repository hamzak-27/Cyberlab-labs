import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ModuleList({ modules, courseId }) {
  const navigate = useNavigate();
  const [expandedModule, setExpandedModule] = useState(null);

  if (!modules || modules.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-[#141d2b] to-[#0f1621] rounded-3xl border border-gray-700/50 p-12">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>

        <div className="relative text-center">
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
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Modules Yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Start building your course by adding your first module. Structure
            your content into organized learning sections.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/30 rounded-lg text-blue-400 text-sm">
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
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            Click "Add Module" button above to get started
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {modules.map((module, index) => {
        const isExpanded = expandedModule === module._id;
        const isFirst = index === 0;
        const isLast = index === modules.length - 1;

        return (
          <div
            key={module._id}
            className="group relative overflow-hidden bg-gradient-to-br from-[#141d2b] to-[#0f1621] rounded-2xl border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300"
          >
            {/* Glowing effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Connecting line to next module */}
            {!isLast && (
              <div className="absolute left-[3.25rem] top-full w-0.5 h-4 bg-gradient-to-b from-gray-600 to-transparent"></div>
            )}

            <div className="relative p-6">
              <div className="flex items-start gap-6">
                {/* Module Number with Progress Ring */}
                <div className="flex-shrink-0 relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <span className="relative text-2xl font-bold bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {module.order}
                    </span>
                  </div>

                  {/* Status indicator */}
                  {module.isLocked && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-[#141d2b]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
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
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                          {module.title}
                        </h3>
                        {isFirst && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            First
                          </span>
                        )}
                      </div>

                      {module.description && (
                        <p className="text-gray-400 text-left text-sm leading-relaxed line-clamp-2">
                          {module.description}
                        </p>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setExpandedModule(isExpanded ? null : module._id)
                        }
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
                        title={isExpanded ? "Collapse" : "Expand"}
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
                          className={`transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Module Stats */}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
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
                      </div>
                      <span className="text-sm text-gray-400">
                        <span className="text-white font-semibold"></span>{" "}
                        Lessons
                      </span>
                    </div>

                    {module.isLocked && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-yellow-400"
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
                        <span className="text-sm text-gray-400">Locked</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-purple-400"
                        >
                          <path d="M3 3v18h18" />
                          <path d="m19 9-5 5-4-4-3 3" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-400">
                        Order #{module.order}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {module.unlockCondition && (
                        <div className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
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
                            className="text-blue-400 flex-shrink-0 mt-0.5"
                          >
                            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                          </svg>
                          <div>
                            <p className="text-xs font-medium text-blue-400 mb-1">
                              Unlock Condition
                            </p>
                            <p className="text-sm text-gray-300">
                              {module.unlockCondition}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/courses/${courseId}/modules/${module._id}/lessons`
                            )
                          }
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-600/20"
                        >
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
                          >
                            <path d="m16 6 4 14" />
                            <path d="M12 6v14" />
                            <path d="M8 8v12" />
                            <path d="M4 4v16" />
                          </svg>
                          Manage Lessons
                        </button>
                        <button
                          className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
                          title="Edit Module"
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
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                        <button
                          className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-all"
                          title="Delete Module"
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
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Action Buttons (when not expanded) */}
                  {!isExpanded && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/courses/${courseId}/modules/${module._id}/lessons`
                          )
                        }
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-sm font-medium rounded-lg transition-all border border-blue-500/20"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m16 6 4 14" />
                          <path d="M12 6v14" />
                          <path d="M8 8v12" />
                          <path d="M4 4v16" />
                        </svg>
                        Lessons
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ModuleList;
