import React, { useEffect, useState } from "react";
import axios from "axios";
import CourseList from "@/components/AddCourse/CourseList";
import NavBar from "@/components/NavBar/NavBar";
import CourseForm from "@/components/AddCourse/CourseForm";

function AdminDashboard({ user }) {
  const [data, setData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/courses", {
          withCredentials: true,
        });
        setData(res.data.course);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (courseId, title) => {
    const confirm = window.confirm(
      `if you want to delete Course title: ${title} press OK`
    );
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5001/api/courses/${courseId}`, {
        withCredentials: true,
      });
      setData(data.filter((course) => course._id !== courseId));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-[#0b121f] min-h-screen">
      <NavBar user={user} />

      {/* Course List */}
      <div className="pt-20">
        <CourseList data={data} handleDelete={handleDelete} />
      </div>

      {/* Modal */}
      <CourseForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
      />

      {/* Floating Add Button */}
      <button
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 bg-blue-600 p-4 rounded-full hover:bg-blue-700 hover:scale-110 transition-all shadow-lg shadow-blue-600/50"
        onClick={() => setIsModalOpen(true)}
        aria-label="Add new course"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      </button>
    </div>
  );
}

export default AdminDashboard;
