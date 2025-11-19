import React, { useState, useEffect } from "react";
import axios from "axios";

function ModuleForm({ isOpen, onClose, courseId }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: "",
    isLocked: true,
    unlockCondition: "Complete previous module",
  });

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData, courseId, "this is data ");
    try {
      const moduleData = {
        ...formData,
        order: Number(formData.order),
        courseId, // passed from parent
      };
      console.log(moduleData);

      const response = await axios.post(
        "http://localhost:5001/api/module/create-module",
        moduleData,
        { withCredentials: true }
      );

      console.log("Module created:", response.data);
      setFormData({
        title: "",
        description: "",
        order: "",
        isLocked: true,
        unlockCondition: "Complete previous module",
      });
      onClose();
    } catch (error) {
      console.error("Error creating module:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative bg-[#141d2b] rounded-2xl shadow-2xl w-full max-w-2xl mx-4 my-8 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="font-bold text-2xl text-white">Add New Module</h3>
          <button
            className="w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-700 text-white flex items-center justify-center transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit}
            id="moduleForm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-gray-300 text-sm font-medium">
                  Module Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter module title"
                  className="w-full px-4 py-3 bg-[#0b121f] text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-gray-300 text-sm font-medium">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter module description"
                  rows="4"
                  className="w-full px-4 py-3 bg-[#0b121f] text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                ></textarea>
              </div>

              {/* Order */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-300 text-sm font-medium">
                  Order (number)
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  placeholder="e.g., 1"
                  min="1"
                  className="w-full px-4 py-3 bg-[#0b121f] text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Locked toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-300 text-sm font-medium">
                  Locked
                </label>
                <input
                  type="checkbox"
                  name="isLocked"
                  checked={formData.isLocked}
                  onChange={handleChange}
                  className="w-6 h-6 accent-blue-600"
                />
              </div>

              {/* Unlock Condition */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-gray-300 text-sm font-medium">
                  Unlock Condition
                </label>
                <input
                  type="text"
                  name="unlockCondition"
                  value={formData.unlockCondition}
                  onChange={handleChange}
                  placeholder="e.g., Complete previous module"
                  className="w-full px-4 py-3 bg-[#0b121f] text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            type="submit"
            form="moduleForm"
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Save Module
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

export default ModuleForm;
