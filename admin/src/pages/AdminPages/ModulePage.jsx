import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "@/components/NavBar/NavBar";
import ModuleList from "@/components/AddModule/ModuleList";
import ModuleForm from "@/components/AddModule/ModuleForm";

function ModulePage({ user }) {
  const { id } = useParams(); // Course ID
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleModuleCreated = () => {
    fetchCourseAndModules(); // Refresh the module list
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#0b121f] min-h-screen">
      <NavBar user={user} />

      <div className="pt-20 px-4 max-w-6xl h-fit pb-16 mx-auto">
        {/* Back Button & Course Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/courses")}
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
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Courses
          </button>

          {course && (
            <div className="bg-[#141d2b] rounded-2xl p-6 border border-gray-700">
              <h1 className="text-3xl font-bold text-white mb-2">
                {course.title}
              </h1>
              <p className="text-gray-400 mb-4">{course.detail}</p>
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm">
                  {course.type}
                </span>
                <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-sm">
                  {course.complexity}
                </span>
                <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-sm">
                  {course.hours} Hours
                </span>
                <span className="px-3 py-1 bg-orange-600/20 text-orange-400 rounded-lg text-sm">
                  {modules.length} Modules
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modules Section */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Course Modules</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
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
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add Module
            </button>
          </div>
          ;''
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Loading modules...</p>
            </div>
          ) : (
            <ModuleList modules={modules} courseId={id} />
          )}
        </div>
      </div>

      {/* Module Form Modal */}
      <ModuleForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courseId={id}
        onModuleCreated={handleModuleCreated}
        existingModulesCount={modules.length}
      />
    </div>
  );
}

export default ModulePage;
