import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Modules({ user }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const categories = ["All", "General", "Defensive", "Offensive"];
  const difficulties = ["All", "Fundamental", "Medium", "Hard"];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5001/api/courses", {
        withCredentials: true,
      });
      setCourses(response.data.course || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      selectedCategory === "All" || course.type === selectedCategory;
    const matchesDifficulty =
      difficultyFilter === "All" || course.complexity === difficultyFilter;
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.detail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  // Calculate stats
  const totalCourses = courses.length;
  const completedCourses = 0; // TODO: Get from user progress
  const inProgressCourses = 0; // TODO: Get from user progress
  const avgProgress = 0; // TODO: Calculate from user progress

  const getCategoryColor = (type) => {
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
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "Medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "Hard":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                My Learning
              </h1>
              <p className="text-gray-400">
                Master cybersecurity through hands-on courses
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#141d2b] to-[#0b121f] rounded-lg border border-gray-800/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                  {user?.name?.charAt(0) || "S"}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">
                    {user?.name || "Student"}
                  </div>
                  <div className="text-gray-400 text-xs">Learner</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Courses */}
            <div className="relative bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-xl border border-gray-800/50 p-4 overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-blue-500/5 transition-all"></div>
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-blue-500/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-blue-400"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium">
                    Total Courses
                  </p>
                  <p className="text-white text-2xl font-bold">
                    {totalCourses}
                  </p>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="relative bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-xl border border-gray-800/50 p-4 overflow-hidden group hover:border-green-500/50 transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:to-green-500/5 transition-all"></div>
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border border-green-500/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-green-400"
                  >
                    <path d="M12 2a10 10 0 0 1 7.38 16.75" />
                    <path d="M12 8v8" />
                    <path d="m16 12-4 4-4-4" />
                    <path d="M2.5 8.875a10 10 0 0 0-.5 3" />
                    <path d="M2.83 16a10 10 0 0 0 2.43 3.4" />
                    <path d="M4.636 5.235a10 10 0 0 1 .891-.857" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium">Completed</p>
                  <p className="text-white text-2xl font-bold">
                    {completedCourses}
                  </p>
                </div>
              </div>
            </div>

            {/* In Progress */}
            <div className="relative bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-xl border border-gray-800/50 p-4 overflow-hidden group hover:border-yellow-500/50 transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:to-yellow-500/5 transition-all"></div>
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center border border-yellow-500/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-yellow-400"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium">
                    In Progress
                  </p>
                  <p className="text-white text-2xl font-bold">
                    {inProgressCourses}
                  </p>
                </div>
              </div>
            </div>

            {/* Avg Progress */}
            <div className="relative bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-xl border border-gray-800/50 p-4 overflow-hidden group hover:border-purple-500/50 transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-purple-500/5 transition-all"></div>
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center border border-purple-500/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-purple-400"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium">
                    Avg Progress
                  </p>
                  <p className="text-white text-2xl font-bold">
                    {avgProgress}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-2xl border border-gray-800/50 p-6 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-500"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#0b121f] text-white border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                Category:
              </div>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20"
                      : "bg-[#0b121f] text-gray-400 hover:text-white border border-gray-800/50 hover:border-gray-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                Difficulty:
              </div>
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setDifficultyFilter(difficulty)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    difficultyFilter === difficulty
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/20"
                      : "bg-[#0b121f] text-gray-400 hover:text-white border border-gray-800/50 hover:border-gray-700"
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1 ? "Course" : "Courses"} Found
          </h2>
          {(selectedCategory !== "All" ||
            difficultyFilter !== "All" ||
            searchTerm) && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                setDifficultyFilter("All");
                setSearchTerm("");
              }}
              className="px-4 py-2 text-sm font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Loading courses...</p>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-2xl border border-gray-800/50">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-gray-500"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No courses found
            </h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setDifficultyFilter("All");
                setSearchTerm("");
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/20"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="group relative bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-2xl border border-gray-800/50 overflow-hidden hover:border-blue-500/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate(`/courses/${course._id}/modules`)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all"></div>

                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141d2b] via-transparent to-transparent"></div>

                  {/* Badges on image */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <div
                      className={`px-3 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${getCategoryColor(
                        course.type
                      )} shadow-lg`}
                    >
                      {course.type}
                    </div>
                    <div className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-black/50 backdrop-blur-sm border border-white/20">
                      {course.hours}h
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="relative p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.detail}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                      {course.modules?.length || 0} Modules
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-semibold border ${getComplexityColor(
                        course.complexity
                      )}`}
                    >
                      {course.complexity}
                    </div>
                  </div>

                  {/* Tags */}
                  {course.tag && course.tag.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.tag.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-gray-700/50 text-gray-400 rounded border border-gray-600/50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  <button className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group-hover:shadow-blue-600/40">
                    Start Learning
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="group-hover:translate-x-1 transition-transform"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modules;
