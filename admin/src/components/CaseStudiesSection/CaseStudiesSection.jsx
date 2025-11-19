import React from "react";
import "./CaseStudiesSection.css";

const caseStudies = [
  {
    title: "Cyber Solutions",
    description:
      "Corporate Office Security: Addressing unauthorized access incidents",
    bullets: [
      "Live monitoring & reports.",
      "85% fewer security breaches.",
      "Enhanced tenant satisfaction ratings",
    ],
    image:
      "https://framerusercontent.com/images/xbouawoDsO32i9ukVY1Ongq6STU.png",
    shape:
      "https://framerusercontent.com/images/CfzVp8kJuwa335WS2z7fC6orkR4.svg",
    link: "./service/cyber-solutions",
  },
  {
    title: "Peace Mind Guaranteed",
    description:
      "Expert crowd management for large gatherings and sensitive VIP zones.",
    bullets: [
      "No significant incidents recorded",
      "Streamlined guest entry and exit.",
      "Commended by local law enforcement.",
    ],
    image:
      "https://framerusercontent.com/images/Y3mFF5lD5a3YIlB2As7L39vTnDc.png",
    shape:
      "https://framerusercontent.com/images/CfzVp8kJuwa335WS2z7fC6orkR4.svg",
    link: "./service/peace-mind-guaranteed",
  },
  {
    title: "Security for Events",
    description: "Crowd management for large events and VIP areas.",
    bullets: [
      "No significant incidents recorded",
      "Streamlined guest entry and exit.",
      "Commended by local law enforcement.",
    ],
    image:
      "https://framerusercontent.com/images/5F4z2ZB0XpL0BXtdPuAGuQZe64.png",
    shape:
      "https://framerusercontent.com/images/CfzVp8kJuwa335WS2z7fC6orkR4.svg",
    link: "./service/security-for-events",
  },
  {
    title: "ClearZone Surveillance",
    description: "Crowd management for large events and VIP areas.",
    bullets: [
      "No significant incidents recorded",
      "Streamlined guest entry and exit.",
      "Commended by local law enforcement.",
    ],
    image:
      "https://framerusercontent.com/images/A5MVjc4vC5mgXln5o4okqlCtplk.png",
    shape:
      "https://framerusercontent.com/images/CfzVp8kJuwa335WS2z7fC6orkR4.svg",
    link: "./service/clearzone-surveillance",
  },
];

const CaseStudiesSection = () => {
  return (
    <section
      id="courses"
      className="py-20 pt-5 bg-gradient-to-br from-[#141d2b] via-[#0b121f] to-[#141d2b]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Comprehensive{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Course Catalog
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose your learning path and master cybersecurity skills
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* General Security */}
          <div className="group relative bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-2xl border border-gray-800/50 p-8 hover:border-blue-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all"></div>

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-3xl mb-6">
                🛡️
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                General Security
              </h3>
              <p className="text-gray-400 mb-6">
                Foundation concepts, security principles, and compliance
                frameworks
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-400">
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
                  8 Comprehensive Courses
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
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
                  Beginner to Intermediate
                </div>
              </div>

              <button className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-green-500/50 rounded-lg text-white font-semibold transition-all">
                Explore Courses →
              </button>
            </div>
          </div>

          {/* Defensive Security */}
          <div className="group relative bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-2xl border border-blue-500/30 p-8 hover:border-blue-500/70 transition-all transform scale-105 shadow-2xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white text-xs font-bold">
              MOST POPULAR
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl"></div>

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-3xl mb-6">
                🔒
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Defensive Security
              </h3>
              <p className="text-gray-400 mb-6">
                Protect systems, detect threats, and respond to security
                incidents
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-400">
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
                  12 Comprehensive Courses
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
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
                  Intermediate to Advanced
                </div>
              </div>

              <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-semibold transition-all shadow-lg shadow-blue-600/20">
                Explore Courses →
              </button>
            </div>
          </div>

          {/* Offensive Security */}
          <div className="group relative bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-2xl border border-gray-800/50 p-8 hover:border-red-500/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-orange-500/0 group-hover:from-red-500/10 group-hover:to-orange-500/10 rounded-2xl transition-all"></div>

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-3xl mb-6">
                ⚔️
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Offensive Security
              </h3>
              <p className="text-gray-400 mb-6">
                Ethical hacking, penetration testing, and red team operations
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-red-400"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  15 Comprehensive Courses
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-red-400"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Intermediate to Expert
                </div>
              </div>

              <button className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-red-500/50 rounded-lg text-white font-semibold transition-all">
                Explore Courses →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
