import React, { useState, useEffect } from "react";
import axios from "axios";

function LessonForm({
  isOpen,
  onClose,
  moduleId,
  onLessonCreated,
  existingLessonsCount,
}) {
  const [formData, setFormData] = useState({
    title: "",
    markdownContent: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setFormData((prev) => ({
        ...prev,
      }));
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, existingLessonsCount]);

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
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5001/api/lesson/create-lesson",
        {
          ...formData,
          id: moduleId,
        },
        { withCredentials: true }
      );

      console.log("Lesson created:", response.data);

      setFormData({
        title: "",
        markdownContent: "",
      });

      onLessonCreated();
    } catch (err) {
      console.error("Error creating lesson:", err);
      setError(err.response?.data?.message || "Failed to create lesson");
    } finally {
      setLoading(false);
    }
  };

  const insertMarkdown = (syntax) => {
    const textarea = document.getElementById("markdownContent");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.markdownContent;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    let newText = before + syntax.replace("TEXT", selected || "text") + after;

    setFormData((prev) => ({
      ...prev,
      markdownContent: newText,
    }));

    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative bg-[#141d2b] rounded-2xl shadow-2xl w-full max-w-6xl mx-4 my-8 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h3 className="font-bold text-2xl text-white">Create New Lesson</h3>
            <p className="text-gray-400 text-sm mt-1">
              Write your lesson content using Markdown
            </p>
          </div>
          <button
            className="w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-700 text-white flex items-center justify-center transition-colors"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
            id="lessonForm"
          >
            {/* Left Column - Form */}
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-gray-300 text-sm font-medium">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Introduction to React Hooks"
                    className="w-full px-4 py-3 bg-[#0b121f] text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Markdown Toolbar */}
              <div>
                <label className="text-gray-300 text-sm font-medium mb-2 block">
                  Lesson Content (Markdown) *
                </label>

                <div className="flex flex-wrap gap-2 mb-2 p-3 bg-[#0b121f] rounded-lg border border-gray-700">
                  <button
                    type="button"
                    onClick={() => insertMarkdown("# TEXT")}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                    title="Heading 1"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("## TEXT")}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("**TEXT**")}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors font-bold"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("*TEXT*")}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors italic"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("`TEXT`")}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors font-mono"
                    title="Inline Code"
                  >
                    Code
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("```javascript\nTEXT\n```")}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                    title="Code Block"
                  >
                    Block
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("[TEXT](url)")}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                    title="Link"
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("![alt](image-url)")}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                    title="Image"
                  >
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("- TEXT")}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                    title="Bullet List"
                  >
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertMarkdown(
                        "| Header | Header |\n|--------|--------|\n| Cell   | Cell   |"
                      )
                    }
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                    title="Table"
                  >
                    Table
                  </button>
                </div>

                <textarea
                  id="markdownContent"
                  name="markdownContent"
                  value={formData.markdownContent}
                  onChange={handleChange}
                  placeholder="Write your lesson content here using Markdown..."
                  rows="18"
                  className="w-full px-4 py-3 bg-[#0b121f] text-white border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none font-mono text-sm"
                  required
                ></textarea>
              </div>
            </div>

            {/* Right Column - Markdown Guide */}
            <div className="lg:max-h-[calc(95vh-200px)] overflow-y-auto">
              <div className="sticky top-0 bg-[#141d2b] pb-2 mb-2">
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="flex items-center justify-between w-full p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg text-white hover:from-blue-600/30 hover:to-purple-600/30 transition-all"
                >
                  <span className="font-semibold flex items-center gap-2">
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
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <path d="M12 17h.01" />
                    </svg>
                    Markdown Guide
                  </span>
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
                    className={`transition-transform ${
                      showGuide ? "rotate-180" : ""
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>

              {showGuide && (
                <div className="space-y-4 pr-2">
                  {/* Headings */}
                  <div className="bg-[#0b121f] rounded-lg p-4 border border-gray-700">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <span className="text-blue-400">#</span> Headings
                    </h4>
                    <div className="space-y-1 text-sm font-mono">
                      <div className="text-gray-400"># Large Heading</div>
                      <div className="text-gray-400">## Medium Heading</div>
                      <div className="text-gray-400">### Small Heading</div>
                    </div>
                  </div>

                  {/* Text Formatting */}
                  <div className="bg-[#0b121f] rounded-lg p-4 border border-gray-700">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <span className="text-blue-400">Aa</span> Text Formatting
                    </h4>
                    <div className="space-y-1 text-sm font-mono">
                      <div className="text-gray-400">**Bold text**</div>
                      <div className="text-gray-400">*Italic text*</div>
                      <div className="text-gray-400">`inline code`</div>
                      <div className="text-gray-400">~~Strikethrough~~</div>
                    </div>
                  </div>

                  {/* Code Blocks */}
                  <div className="bg-[#0b121f] rounded-lg p-4 border border-gray-700">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <span className="text-blue-400">{`</>`}</span> Code Blocks
                    </h4>
                    <div className="text-sm font-mono text-gray-400">
                      <div>```javascript</div>
                      <div className="pl-4">function hello() {`{`}</div>
                      <div className="pl-8">console.log("Hi");</div>
                      <div className="pl-4">{`}`}</div>
                      <div>```</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Supports: javascript, python, java, css, html, etc.
                    </p>
                  </div>

                  {/* Lists */}
                  <div className="bg-[#0b121f] rounded-lg p-4 border border-gray-700">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <span className="text-blue-400">•</span> Lists
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-300 mb-1">Bullet List:</p>
                        <div className="font-mono text-gray-400">
                          <div>- Item 1</div>
                          <div>- Item 2</div>
                          <div> - Sub item</div>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-300 mb-1">Numbered List:</p>
                        <div className="font-mono text-gray-400">
                          <div>1. First</div>
                          <div>2. Second</div>
                          <div>3. Third</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Links & Images */}
                  <div className="bg-[#0b121f] rounded-lg p-4 border border-gray-700">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <span className="text-blue-400">🔗</span> Links & Images
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-300 mb-1">Link:</p>
                        <div className="font-mono text-gray-400">
                          [Link Text](https://example.com)
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-300 mb-1">Image:</p>
                        <div className="font-mono text-gray-400">
                          ![Alt Text](image-url.jpg)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tables */}
                  <div className="bg-[#0b121f] rounded-lg p-4 border border-gray-700">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <span className="text-blue-400">⊞</span> Tables
                    </h4>
                    <div className="text-sm font-mono text-gray-400">
                      <div>| Header 1 | Header 2 |</div>
                      <div>|----------|----------|</div>
                      <div>| Cell 1 | Cell 2 |</div>
                      <div>| Cell 3 | Cell 4 |</div>
                    </div>
                  </div>

                  {/* Blockquotes */}
                  <div className="bg-[#0b121f] rounded-lg p-4 border border-gray-700">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <span className="text-blue-400">"</span> Blockquotes
                    </h4>
                    <div className="text-sm font-mono text-gray-400">
                      {`> This is a quote`}
                    </div>
                  </div>

                  {/* Horizontal Rule */}
                  <div className="bg-[#0b121f] rounded-lg p-4 border border-gray-700">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <span className="text-blue-400">—</span> Divider
                    </h4>
                    <div className="text-sm font-mono text-gray-400">---</div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            type="submit"
            form="lessonForm"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-600/20"
          >
            {loading ? "Creating..." : "Create Lesson"}
          </button>
          <button
            type="button"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default LessonForm;
