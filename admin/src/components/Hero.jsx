import React from "react";
import { Link } from "react-router-dom";
import HomeNav from "./NavBar/HomeNav";

const FeatureCard = ({ title, description, icon }) => {
  return (
    <div className="feature-card">
      <div className={`feature-icon ${icon || ""}`} aria-hidden="true" />
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};

const TestimonialCard = ({ quote, author, position }) => {
  return (
    <div className="testimonial-card">
      <div className="quote-mark" aria-hidden="true">
        "
      </div>
      <p className="testimonial-quote">{quote}</p>
      <div className="testimonial-author">
        <div className="author-name">{author}</div>
        <div className="author-position">{position}</div>
      </div>
    </div>
  );
};

const Hero = () => {
  return (
    <>
      <HomeNav />

      <section
        id="home"
        className="relative min-h-screen bg-gradient-to-br from-[#0b121f] via-[#141d2b] to-[#0b121f] overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full backdrop-blur-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-blue-400 text-sm font-semibold">
                  Now Offering Online Training
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  Master Cybersecurity
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Through Real-World Training
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-gray-400 leading-relaxed max-w-xl">
                Learn offensive and defensive security techniques from industry
                experts. Start with comprehensive text-based courses and advance
                your cybersecurity career.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    Start Now
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
                      className="group-hover:translate-x-1 transition-transform"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </button>

                <button className="px-8 py-4 rounded-xl font-semibold text-white border border-gray-700 hover:border-blue-500/50 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
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
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Watch Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-[#0b121f] flex items-center justify-center text-white text-xs font-bold"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="text-white font-semibold">10,000+</div>
                    <div className="text-gray-500 text-xs">Active Students</div>
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-800"></div>

                <div className="text-sm">
                  <div className="flex items-center gap-1 text-yellow-400 font-semibold">
                    4.9
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div className="text-gray-500 text-xs">500+ Reviews</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              {/* Floating card mockup */}
              <div className="relative">
                {/* Main card */}
                <div className="relative bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-2xl border border-gray-800/50 p-6 shadow-2xl">
                  {/* Terminal header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-auto text-xs text-gray-500 font-mono">
                      terminal
                    </span>
                  </div>

                  {/* Code content */}
                  <div className="font-mono text-sm space-y-2">
                    <div className="text-green-400">$ macksofy-learn start</div>
                    <div className="text-gray-500">
                      Initializing cybersecurity training...
                    </div>
                    <div className="text-blue-400">
                      ✓ Loading course: Penetration Testing
                    </div>
                    <div className="text-blue-400">
                      ✓ Modules: 15 | Lessons: 127
                    </div>
                    <div className="text-purple-400">
                      ✓ Progress: 34% complete
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>Next lesson:</span>
                      <span className="text-cyan-400">
                        SQL Injection Basics
                      </span>
                    </div>
                    <div className="text-gray-500 mt-4 animate-pulse">▊</div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                  <div className="font-bold">100+</div>
                  <div className="text-xs opacity-90">Lessons</div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                  <div className="font-bold">Certificate</div>
                  <div className="text-xs opacity-90">Included</div>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl -z-10"></div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-gray-500 text-sm">Scroll to explore</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
