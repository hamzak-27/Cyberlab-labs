import React, { useState } from "react";
import EditCourse from "./EditCourse";
import { useNavigate } from "react-router-dom";

function CourseList({ data, handleDelete }) {
  const navigate = useNavigate();
  console.log(data);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);

  const getCategoryGradient = (type) => {
    switch (type) {
      case "General":
        return "from-green-500 to-emerald-500";
      case "Defensive":
        return "from-blue-500 to-cyan-500";
      case "Offensive":
        return "from-red-500 to-orange-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case "Fundamental":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Hard":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            No courses available yet
          </h3>
          <p className="text-gray-400 text-sm">
            Click the + button to add your first course
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-24">
      {data.map((course) => (
        <div
          key={course._id}
          className="group relative bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-2xl border border-gray-800/50 overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-[1.02] cursor-pointer"
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300 pointer-events-none"></div>

          {/* Action buttons - Top right */}
          <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCourse(course);
                setIsModalOpen(true);
              }}
              className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg border border-white/20 transition-all hover:scale-110"
              title="Edit Course"
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
                className="text-white"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(course._id, course.title);
              }}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md rounded-lg border border-red-500/30 transition-all hover:scale-110"
              title="Delete Course"
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
                className="text-red-400"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>

          {/* Course Image */}
          <div
            className="relative h-48 overflow-hidden"
            onClick={() => navigate(`/admin/courses/${course._id}/modules`)}
          >
            <img
              src={course.image}
              alt={course.title || "course image"}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141d2b] via-transparent to-transparent"></div>

            {/* Category and Complexity badges */}
            <div className="absolute top-3 left-3 right-16 flex gap-2">
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${getCategoryGradient(
                  course.type
                )} shadow-lg`}
              >
                {course.type}
              </div>
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getComplexityColor(
                  course.complexity
                )} backdrop-blur-sm`}
              >
                {course.complexity}
              </div>
            </div>

            {/* Hours badge */}
            <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg border border-white/20">
              <div className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {course.hours}h
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div
            className="relative p-6"
            onClick={() => navigate(`/admin/courses/${course._id}/modules`)}
          >
            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
              {course.title}
            </h2>

            <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
              {course.detail}
            </p>

            {/* Tags */}
            {course.tag && course.tag.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {course.tag.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2.5 py-1 bg-gray-700/50 text-gray-300 rounded-md border border-gray-600/50 hover:bg-gray-700 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
                {course.tag.length > 3 && (
                  <span className="text-xs px-2.5 py-1 bg-gray-700/50 text-gray-400 rounded-md border border-gray-600/50">
                    +{course.tag.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Course Stats */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-700/50">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
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
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="font-medium">{course.hours}h</span>
              </div>

              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
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
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <span className="font-medium">
                  {course.modules?.length || 0} Modules
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="font-medium">{course.complexity}</span>
              </div>
            </div>

            {/* View Details Button */}
            <button className="w-full mt-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/40 flex items-center justify-center gap-2">
              <span>View Modules</span>
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
                className="group-hover:translate-x-1 transition-transform"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      {/* ✅ Modal rendered only once */}
      {isModalOpen && selectedCourse && (
        <EditCourse
          isOpen={isModalOpen}
          course={selectedCourse}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default CourseList;
