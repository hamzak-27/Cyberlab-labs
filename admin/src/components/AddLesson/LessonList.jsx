import React from "react";

function LessonList({ lessons, selectedLesson, onLessonSelect }) {
  if (!lessons || lessons.length === 0) {
    return (
      <div className="sticky top-32">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#141d2b] to-[#0f1621] rounded-2xl border border-gray-700/50 p-10">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>
          
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
            <p className="text-gray-400 text-sm font-medium">No lessons available</p>
            <p className="text-gray-500 text-xs mt-1">Create your first lesson</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-32 space-y-4">
      {/* Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#141d2b] to-[#0f1621] rounded-2xl border border-gray-700/50 p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-bold text-lg">Lessons</h3>
            <div className="px-2.5 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg">
              <span className="text-xs font-bold text-blue-400">{lessons.length}</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm">Select a lesson to view content</p>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-500">Progress</span>
              <span className="text-gray-400 font-semibold">
                {lessons.filter(l => l.isCompleted).length}/{lessons.length}
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(lessons.filter(l => l.isCompleted).length / lessons.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson List */}
      <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scrollbar">
        {lessons.map((lesson, index) => {
          const isSelected = selectedLesson?._id === lesson._id;
          const isCompleted = lesson.isCompleted;
          const isFirst = index === 0;
          const isLast = index === lessons.length - 1;
          
          return (
            <div key={lesson._id} className="relative">
              {/* Connecting line */}
              {!isLast && (
                <div className="absolute left-[1.75rem] top-14 w-0.5 h-[calc(100%+0.5rem)] bg-gradient-to-b from-gray-700 to-transparent z-0"></div>
              )}

              <button
                onClick={() => onLessonSelect(lesson)}
                className={`relative w-full text-left rounded-xl border transition-all duration-300 group ${
                  isSelected
                    ? "bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/10 border-blue-500/50 shadow-xl shadow-blue-600/10 scale-[1.02]"
                    : "bg-[#141d2b] border-gray-700/50 hover:border-gray-600 hover:bg-[#1a2332] hover:scale-[1.01]"
                }`}
              >
                {/* Glowing effect for selected */}
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-xl blur-xl -z-10"></div>
                )}

                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Lesson number badge */}
                    <div className="relative flex-shrink-0 z-10">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base transition-all ${
                          isSelected
                            ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30"
                            : isCompleted
                            ? "bg-green-500/20 text-green-400 border-2 border-green-500/30"
                            : "bg-gray-700/50 text-gray-400 border-2 border-gray-600/30"
                        }`}
                      >
                        {isCompleted ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          lesson.order
                        )}
                      </div>

                      {/* Pulse animation for selected */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 animate-ping opacity-20"></div>
                      )}
                    </div>

                    {/* Lesson content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4
                          className={`font-semibold line-clamp-2 transition-colors ${
                            isSelected 
                              ? "text-white" 
                              : "text-gray-300 group-hover:text-white"
                          }`}
                        >
                          {lesson.title}
                        </h4>
                        
                        {isSelected && (
                          <div className="flex-shrink-0 mt-1">
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
                              className="text-blue-400 animate-pulse"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-xs">
                        <span
                          className={`font-medium ${
                            isSelected 
                              ? "text-blue-400" 
                              : "text-gray-500 group-hover:text-gray-400"
                          }`}
                        >
                          Lesson {lesson.order}
                        </span>

                        {isFirst && (
                          <>
                            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                            <span className="flex items-center gap-1 text-green-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              Start
                            </span>
                          </>
                        )}

                        {lesson.markdownContent && (
                          <>
                            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                            <span className={isSelected ? "text-gray-400" : "text-gray-500"}>
                              ~{Math.ceil(lesson.markdownContent.split(' ').length / 200)} min
                            </span>
                          </>
                        )}
                      </div>

                      {/* Progress indicator */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-gray-700/50">
                          <div className="flex items-center gap-2 text-xs text-blue-400">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="font-medium">Currently viewing</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover effect border */}
                {!isSelected && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-blue-500/10 transition-all pointer-events-none"></div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom stats */}
      <div className="bg-gradient-to-br from-[#141d2b] to-[#0f1621] rounded-xl border border-gray-700/50 p-4">
        <div className="flex items-center justify-between text-sm">
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Duration</p>
              <p className="text-white font-semibold">
                ~{Math.ceil(lessons.reduce((acc, l) => acc + (l.markdownContent?.split(' ').length || 0), 0) / 200)} min
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
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
                className="text-green-400"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-white font-semibold">
                {lessons.filter(l => l.isCompleted).length}/{lessons.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
    </div>
  );
}

export default LessonList;