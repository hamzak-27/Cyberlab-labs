// src/pages/ModuleContentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function ModuleContentPage({user}) {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  const [allModules, setAllModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const authUser = useAuthStore((s) => s.user);

  // Fetch all modules of the course
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/module/${courseId}/modules`, {
          withCredentials: true,
        });
        setAllModules(res.data.modules || []);
      } catch (err) {
        console.error('Error fetching modules:', err);
        toast.error('Failed to fetch modules');
      }
    };
    fetchModules();
  }, [courseId]);

  // Fetch current module's lesson
  useEffect(() => {
    const fetchLesson = async () => {
      if (!moduleId) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/lesson/${moduleId}/lessons`,
          { withCredentials: true }
        );
        setCurrentModule(res.data.module || null);
        setLesson(res.data.lessons || null); // lessons is a single object
      } catch (err) {
        console.error('Error fetching lesson:', err);
        toast.error('Failed to fetch lesson');
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [moduleId]);

  const goBack = () => navigate(`/courses/${courseId}`);

  const markLessonComplete = async () => {
    if (!lesson) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/progress/lesson/complete`,
        {
          userId: user._id,
          courseId,
          moduleId,
          lessonId: lesson._id,
        },
        { withCredentials: true }
      );

      toast.success('Lesson marked complete');

      // Navigate to next module's lesson
      const currentIndex = allModules.findIndex((m) => m._id === moduleId);
      const nextModule = allModules[currentIndex + 1];

      if (nextModule) {
        navigate(`/courses/${courseId}/${nextModule._id}/learn`);
      } else {
        toast('You have completed all modules!');
      }
    } catch (err) {
      console.error('markLessonComplete error:', err);
      toast.error('Could not mark lesson complete');
    }
  };

  const markdownComponents = {
    // ... (keep the same markdown components you already have)
    // I leave them unchanged to avoid verbosity in this response.
    // Copy the same markdownComponents from your original file here (unchanged).
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
        <div className='overflow-x-auto overflow-y-hidden scrollbar-hide-desktop '>

       
        <code
          className="px-2 py-1 bg-gray-800/70 text-blue-400 rounded-md text-sm font-mono border border-gray-700 whitespace-nowrap"
          {...props}
        >
          {children}
        </code>
         </div>
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
  }


  if (loading) return <p className="text-white text-center mt-12">Loading...</p>;
  if (!currentModule || !lesson)
    return <p className="text-white text-center mt-12">Module or lesson not found.</p>;

  return (
     <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <main className="flex-1 p-3  md:pt-6 md:mx-16 overflow-auto scrollbar-hide-desktop overflow-y-hidden">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />} onClick={goBack} className="mb-4">
            Back to Modules
          </Button>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Lesson Content */}
          <div className="flex-1 lg:w-2/3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {lesson ? (
                <div className="space-y-16 rounded-lg border border-gray-700 p-9">
                  <div key={lesson._id} id={`lesson-${lesson._id}`} className="scroll-mt-24 border-gray-700">
                    <div className="mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{}</span>
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white">{lesson.title}</h2>
                          <p className="text-sm text-gray-500">
                            ~{Math.ceil(lesson.markdownContent.split(" ").length / 200)} min read
                          </p>
                        </div>
                      </div>
                      <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-transparent rounded-full"></div>
                    </div>

                    <div className="prose prose-invert prose-blue prose-lg max-w-none border-gray-700">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {lesson.markdownContent}
                      </ReactMarkdown>
                    </div>

                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                      <Button
                        variant="secondary"
                        icon={<Check className="w-4 h-4" />}
                        onClick={() => markLessonComplete(lesson)}
                        className="mb-4 ml-auto"
                      >
                        Mark as Complete
                      </Button>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-[#141d2b] rounded-2xl border border-gray-700">
                  <p className="text-gray-400">No lessons in this module yet</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 flex-shrink-0">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Continue Learning</h3>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    onClick={() => navigate(`/courses/${courseId}/${moduleId}/video`, { state: lesson.title })}
                  >
                    Watch Video Lesson
                  </Button>
                  <Button variant="secondary" className="w-full justify-start" onClick={goBack}>
                    Back to Module List
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
