import React, { useRef, useEffect } from "react";

const Home_page = () => {
  return (
    <section
      id="about"
      className="py-20 pt-5 bg-gradient-to-br from-[#141d2b] via-[#0b121f] to-[#141d2b]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/30 rounded-full">
              <span className="text-blue-400 text-sm font-semibold">
                About Us
              </span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Transforming{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Offline Excellence
              </span>{" "}
              Into Online Impact
            </h2>

            <p className="text-lg text-gray-400 leading-relaxed">
              Macksofy Tech has been delivering world-class cybersecurity
              training through offline workshops for years. Now, we're bringing
              that same expertise, hands-on approach, and proven methodology to
              the online world.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-green-400"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-left font-semibold mb-1">
                    Industry-Tested Methods
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Training techniques proven in real-world offline sessions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
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
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-left font-semibold mb-1">
                    Expert Instructors
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Learn from professionals who've trained thousands in-person
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-purple-400"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-left font-semibold mb-1">
                    Scalable Learning
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Access premium training from anywhere, anytime
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Image/Visual */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-2xl border border-gray-800/50 p-8 shadow-2xl">
              <div className="space-y-6">
                {/* Stat card 1 */}
                <div className="flex items-center gap-4 bg-blue-600/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                    5+
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      Years of Offline Training
                    </div>
                    <div className="text-gray-400 text-sm">
                      Proven track record
                    </div>
                  </div>
                </div>

                {/* Stat card 2 */}
                <div className="flex items-center gap-4 bg-purple-600/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                    3K+
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      Offline Students Trained
                    </div>
                    <div className="text-gray-400 text-sm">
                      Now going digital
                    </div>
                  </div>
                </div>

                {/* Stat card 3 */}
                <div className="flex items-center gap-4 bg-green-600/10 border border-green-500/30 rounded-xl p-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl">
                    95%
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      Job Placement Rate
                    </div>
                    <div className="text-gray-400 text-sm">
                      Real career results
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home_page;
