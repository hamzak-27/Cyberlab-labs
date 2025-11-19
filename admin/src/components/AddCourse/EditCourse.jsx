import React, { useState, useEffect } from "react";
import axios from "axios";

function EditCourse({ isOpen, onClose, course }) {
  const [formData, setFormData] = useState({
    title: course.title,
    detail: course.detail,
    image: course.image,
    tag: course.tag,
    hours: course.hours,
    complexity: course.complexity,
    type: course.type,
  });
  console.log(course._id, "this is current element id");

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert tags string to array
      const tags = formData.tag;

      // .split(",")
      // .map((tag) => tag.trim())
      // .filter((tag) => tag);

      const courseData = {
        ...formData,
        tag: tags,
        hours: Number(formData.hours),
      };

      // API call here
      const response = await axios.put(
        `http://localhost:5001/api/courses/${course._id}`,
        courseData,
        { withCredentials: true }
      );

      console.log("Course data to submit:", courseData);
      console.log(response);

      // Reset form and close modal
      setFormData({
        title: "",
        detail: "",
        image: "",
        tag: "",
        hours: "",
        complexity: "",
        type: "",
      });
      onClose();
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };
  console.log(formData.tag);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative bg-[#141d2b] rounded-2xl shadow-2xl w-full max-w-3xl mx-4 my-8 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="font-bold text-2xl text-white">Edit Course</h3>
          <button
            className="w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-700 text-white flex items-center justify-center transition-colors"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit}
            id="courseForm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Course Title */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-gray-300 text-sm font-medium">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter course title"
                  className="w-full px-4 py-3 bg-[#0b121f] text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>

              {/* Course Type */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-300 text-sm font-medium">
                  Course Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0b121f] text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  <option value="General">General</option>
                  <option value="Defensive">Defensive</option>
                  <option value="Offensive">Offensive</option>
                </select>
              </div>

              {/* Complexity */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-300 text-sm font-medium">
                  Complexity *
                </label>
                <select
                  name="complexity"
                  value={formData.complexity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0b121f] text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Select complexity
                  </option>
                  <option value="Fundamental">Fundamental</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Hours */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-300 text-sm font-medium">
                  Duration (Hours) *
                </label>
                <input
                  type="number"
                  name="hours"
                  value={formData.hours}
                  onChange={handleChange}
                  placeholder="e.g., 10"
                  min="1"
                  className="w-full px-4 py-3 bg-[#0b121f] text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-300 text-sm font-medium">
                  Tags
                </label>
                <input
                  type="text"
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                  placeholder="e.g., security, networking, basics"
                  className="w-full px-4 py-3 bg-[#0b121f] text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <span className="text-gray-500 text-xs">
                  Separate multiple tags with commas
                </span>
              </div>

              {/* Image URL */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-gray-300 text-sm font-medium">
                  Course Image URL *
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 bg-[#0b121f] text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>

              {/* Course Description */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-gray-300 text-sm font-medium">
                  Course Description *
                </label>
                <textarea
                  name="detail"
                  value={formData.detail}
                  onChange={handleChange}
                  placeholder="Enter detailed course description"
                  rows="4"
                  className="w-full px-4 py-3 bg-[#0b121f] text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  required
                ></textarea>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            type="submit"
            form="courseForm"
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Save Course
          </button>
          <button
            type="button"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditCourse;
