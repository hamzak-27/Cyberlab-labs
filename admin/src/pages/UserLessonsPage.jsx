import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function UserLessonsPage({ user }) {
  const { id, moduleId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [allModules, setAllModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [lessons, setLessons] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    fetchCourseData();
    fetchCurrentModuleData();
  }, [id, moduleId]);

  const fetchCourseData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/module/${id}/modules`,
        { withCredentials: true }
      );
      setCourse(response.data.course);
      setAllModules(response.data.modules || []);
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  const fetchCurrentModuleData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5001/api/lesson/${moduleId}/lessons`,
        { withCredentials: true }
      );
      setCurrentModule(response.data.module);
      setLessons(response.data.lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteModule = () => {
    const currentIndex = allModules.findIndex((m) => m._id === moduleId);
    if (currentIndex < allModules.length - 1) {
      const nextModule = allModules[currentIndex + 1];
      navigate(`/courses/${id}/modules/${nextModule._id}/learn`);
    } else {
      navigate(`/courses/${id}/modules`);
    }
  };

  const scrollToLesson = (lessonId) => {
    const element = document.getElementById(`lesson-${lessonId}`);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(lessonId);
    }
  };

  const markdownComponents = {
    h1: ({ node, ...props }) => (
      <div className="relative mb-8 mt-12 first:mt-0">
        <div className="absolute -left-8 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
        <h1
          className="text-4xl font-bold text-left text-white pb-4 border-b border-gray-700"
          {...props}
        />
      </div>
    ),
    h2: ({ node, ...props }) => (
      <div className="relative mb-6 mt-10">
        <div className="absolute -left-6 top-1 w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
        <h2 className="text-3xl text-left font-bold text-white" {...props} />
      </div>
    ),
    h3: ({ node, ...props }) => (
      <h3
        className="text-2xl  text-left font-semibold text-white mb-4 mt-2"
        {...props}
      />
    ),
    h4: ({ node, ...props }) => (
      <h4
        className="text-xl  font-semibold text-gray-200 mb-3 mt-6"
        {...props}
      />
    ),

    // Paragraphs
    p: ({ node, ...props }) => (
      <p
        className="text-gray-300 text-left leading-relaxed mb-6 text-lg font-serif"
        {...props}
      />
    ),
    ul: ({ node, ...props }) => (
      <ul className="space-y-3 mb-6 text-gray-300" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="space-y-3 mb-6 text-gray-300" {...props} />
    ),
    li: ({ node, children, ...props }) => (
      <li
        className="ml-6 pl-2 text-left relative before:content-[''] before:absolute before:-left-6 before:top-[0.7em] before:w-2 before:h-2 before:bg-blue-500 before:rounded-full"
        {...props}
      >
        <span className="text-lg">{children}</span>
      </li>
    ),

    // Links with gradient underline
    a: ({ node, ...props }) => (
      <a
        className="relative text-blue-400 hover:text-blue-300 transition-colors font-medium no-underline after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-blue-500 after:to-purple-500 after:opacity-50 hover:after:opacity-100 after:transition-opacity"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    img: ({ node, ...props }) => (
      <div className="my-8 group">
        <div className="relative overflow-hidden rounded-2xl border border-gray-700 shadow-2xl hover:border-blue-500/50 transition-all">
          <img className="w-full h-auto" loading="lazy" {...props} />
        </div>
        {props.alt && (
          <p className="text-center text-sm text-gray-500 mt-3 italic">
            {props.alt}
          </p>
        )}
      </div>
    ),
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      const code = String(children).replace(/\n$/, "");
      return !inline && match ? (
        <div className="relative my-6 group">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs text-gray-300 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Copy
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 bg-[#0d1117] border-b border-gray-800">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {match[1]}
              </span>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
            </div>
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              customStyle={{
                margin: 0,
                padding: "1.5rem",
                background: "#0d1117",
                fontSize: "0.95rem",
                lineHeight: "1.6",
              }}
              showLineNumbers={code.split("\n").length > 3}
              {...props}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      ) : (
        <code
          className="px-2 py-1 bg-gray-800/70 text-blue-400 rounded-md text-sm font-mono border border-gray-700 whitespace-nowrap"
          {...props}
        >
          {children}
        </code>
      );
    },
    blockquote: ({ node, ...props }) => (
      <blockquote className="relative border-l-4 border-blue-500 pl-6 py-4 my-6 bg-gradient-to-r from-blue-500/10 to-transparent rounded-r-xl">
        <div className="absolute top-3 left-3 text-blue-500/30 text-6xl leading-none">
          "
        </div>
        <div
          className="relative text-gray-300 italic text-lg pl-6"
          {...props}
        />
      </blockquote>
    ),
    table: ({ node, ...props }) => (
      <div className="my-8 overflow-hidden rounded-2xl border border-gray-700 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full" {...props} />
        </div>
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead
        className="bg-gradient-to-r from-gray-800 to-gray-800/50"
        {...props}
      />
    ),
    tbody: ({ node, ...props }) => (
      <tbody className="divide-y divide-gray-800" {...props} />
    ),
    tr: ({ node, ...props }) => (
      <tr className="hover:bg-gray-800/30 transition-colors" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th
        className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider"
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td className="px-6 py-4 text-gray-300" {...props} />
    ),
    hr: ({ node, ...props }) => (
      <div className="my-12">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
      </div>
    ),
    strong: ({ node, ...props }) => (
      <strong className="font-bold text-white" {...props} />
    ),
    em: ({ node, ...props }) => (
      <em className="italic text-blue-300" {...props} />
    ),
    del: ({ node, ...props }) => (
      <del className="text-gray-500 line-through" {...props} />
    ),
  };

  return (
    <div className="bg-[#0b121f] min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed left-0 top-0 w-80 h-screen bg-[#141d2b] border-r border-gray-700 overflow-y-auto custom-scrollbar">
          <div className="p-6">
            {/* Back button */}
            {course && (
              <div className="mb-6">
                <button
                  onClick={() => navigate(`/courses/${id}/modules`)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-3 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Back to Modules
                </button>
                <h2 className="text-white font-bold text-lg line-clamp-2">
                  {course.title}
                </h2>
              </div>
            )}

            {/* All Modules */}
            <div className="mb-6">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                All Modules
              </h3>
              <div className="space-y-1">
                {allModules.map((module) => (
                  <button
                    key={module._id}
                    onClick={() =>
                      navigate(`/courses/${id}/modules/${module._id}/learn`)
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      module._id === moduleId
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">
                        {module.order}
                      </span>
                      <span className="text-sm truncate">{module.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Module Lessons */}
            {currentModule && (
              <div>
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  {currentModule.title} - Lessons
                </h3>
                <div className="space-y-1">
                  <button
                    key={lessons._id}
                    onClick={() => scrollToLesson(lessons._id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group ${
                      activeSection === lessons._id
                        ? "bg-blue-600/10 border border-blue-500/30 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                          activeSection === lessons._id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-gray-400 group-hover:bg-gray-600"
                        }`}
                      >
                        {lessons.order}
                      </div>
                      <span className="text-sm truncate flex-1">
                        {lessons.title}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-80">
          <div className="max-w-4xl mx-auto px-8 py-12">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-400 mt-4">Loading lessons...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Module Header */}
                {currentModule && (
                  <div className="mb-12 pb-8 border-b border-gray-700">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-blue-400"
                      >
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                      </svg>
                      <span className="text-sm font-semibold text-blue-400">
                        Module {currentModule.order}
                      </span>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">
                      {currentModule.title}
                    </h1>
                    {currentModule.description && (
                      <p className="text-xl text-gray-400 leading-relaxed">
                        {currentModule.description}
                      </p>
                    )}
                  </div>
                )}

                {/* All Lessons */}
                {lessons && lessons.markdownContent ? (
                  <div className="space-y-16">
                    <div
                      key={lessons._id}
                      id={`lesson-${lessons._id}`}
                      className="scroll-mt-24"
                    >
                      {/* Lesson Header */}
                      <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {lessons.order}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold text-white">
                              {lessons.title}
                            </h2>
                            <p className="text-sm text-gray-500">
                              ~
                              {Math.ceil(
                                lessons.markdownContent.split(" ").length / 200
                              )}{" "}
                              min read
                            </p>
                          </div>
                        </div>
                        <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-transparent rounded-full"></div>
                      </div>

                      {/* Lesson Content */}
                      <div className="prose prose-invert prose-blue prose-lg max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {lessons.markdownContent}
                        </ReactMarkdown>
                      </div>

                      {/* Lesson Divider */}
                      {/* {index < lessons.length - 1 && (
                        <div className="mt-16 pt-16 border-t border-gray-700/50"></div>
                      )} */}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-[#141d2b] rounded-2xl border border-gray-700">
                    <p className="text-gray-400">
                      No lessons in this module yet
                    </p>
                  </div>
                )}

                {/* Bottom Navigation */}
                <div className="mt-16 pt-8 border-t border-gray-700 flex items-center justify-between gap-4">
                  <button
                    onClick={() => navigate(`/courses/${id}/modules`)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    All Modules
                  </button>

                  <button
                    onClick={handleCompleteModule}
                    className="group relative flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <span className="relative flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Complete & Next Module
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

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
      `}</style>
    </div>
  );
}

export default UserLessonsPage;
