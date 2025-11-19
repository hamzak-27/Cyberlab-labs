import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import EditLessonForm from "./EditLessonForm";

function LessonPreview({ lesson }) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  console.log(lesson);

  return (
    <div className="relative ">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative bg-gradient-to-br from-[#141d2b] via-[#0f1621] to-[#141d2b] rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>

        {/* Lesson Header */}
        <div className="relative border-b border-gray-700/50">
          {/* Header background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-transparent"></div>

          <div className="relative px-8 py-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                {/* Lesson number badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur opacity-50"></div>
                    <div className="relative px-4 py-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl border border-blue-400/30">
                      <span className="text-sm font-bold text-white">
                        Module {lesson.order}
                      </span>
                    </div>
                  </div>

                  {lesson.isCompleted && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
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
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-xs font-semibold text-green-400">
                        Completed
                      </span>
                    </div>
                  )}
                </div>

                {/* Title
                <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
                  {lesson.title}
                </h1> */}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
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
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>
                      ~
                      {Math.ceil(
                        lesson.markdownContent.split(" ").length / 200
                      )}
                      min read
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  <div className="flex items-center gap-2">
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
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    <span>
                      {lesson.markdownContent.split(" ").length} words
                    </span>
                  </div>
                  {lesson.createdAt && (
                    <>
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="flex items-center gap-2">
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
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="4"
                            rx="2"
                            ry="2"
                          />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        <span>
                          {new Date(lesson.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setSelectedCourse(lesson);
                  }}
                  className="group relative p-3 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800 transition-all overflow-hidden"
                  title="Edit Lesson"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all"></div>
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
                    className="relative text-gray-400 group-hover:text-blue-400 transition-colors"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </button>
                <button
                  className="group relative p-3 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-red-500/50 hover:bg-gray-800 transition-all overflow-hidden"
                  title="Delete Lesson"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-red-500/10 transition-all"></div>
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
                    className="relative text-gray-400 group-hover:text-red-400 transition-colors"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="relative px-3 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-invert prose-blue prose-lg max-w-none markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Headings with decorative elements
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
                      <h2
                        className="text-3xl text-left font-bold text-white"
                        {...props}
                      />
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

                  // Lists with custom styling
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

                  // Images with zoom effect
                  img: ({ node, ...props }) => (
                    <div className="my-8 group cursor-pointer">
                      <div className="relative overflow-hidden rounded-2xl border border-gray-700 shadow-2xl transition-all hover:border-blue-500/50 hover:shadow-blue-500/20">
                        <img
                          className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          {...props}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      {props.alt && (
                        <p className="text-center text-sm text-gray-500 mt-3 italic">
                          {props.alt}
                        </p>
                      )}
                    </div>
                  ),

                  // Code blocks with copy button
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
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                width="14"
                                height="14"
                                x="8"
                                y="8"
                                rx="2"
                                ry="2"
                              />
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

                  // Blockquotes with gradient accent
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="relative border-l-4 border-blue-500 pl-6 py-4 my-6 bg-gradient-to-r from-blue-500/10 to-transparent rounded-r-xl"
                      {...props}
                    >
                      <div className="absolute top-3 left-3 text-blue-500/30 text-6xl leading-none">
                        "
                      </div>
                      <div
                        className="relative text-gray-300 italic text-lg pl-6"
                        {...props}
                      />
                    </blockquote>
                  ),

                  // Tables with modern styling
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
                    <tr
                      className="hover:bg-gray-800/30 transition-colors"
                      {...props}
                    />
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

                  // Horizontal rule with gradient
                  hr: ({ node, ...props }) => (
                    <div className="my-12">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                    </div>
                  ),

                  // Strong/Bold
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-white" {...props} />
                  ),

                  // Emphasis/Italic
                  em: ({ node, ...props }) => (
                    <em className="italic text-blue-300" {...props} />
                  ),

                  // Strikethrough
                  del: ({ node, ...props }) => (
                    <del className="text-gray-500 line-through" {...props} />
                  ),
                }}
              >
                {lesson.markdownContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="border-t border-gray-700/50 p-6 bg-gradient-to-br from-gray-800/30 to-transparent">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div></div>
            {/* <button className="flex items-center gap-2 px-5 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl text-gray-300 hover:text-white transition-all">
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
                <path d="m15 18-6-6 6-6" />
              </svg>
              Previous Lesson
            </button> */}
          </div>
        </div>
      </div>
      {isEditing && selectedCourse && (
        <EditLessonForm
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          lesson={selectedCourse}
        />
      )}
    </div>
  );
}

export default LessonPreview;
