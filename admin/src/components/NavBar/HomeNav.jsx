import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HomeNav() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { name: "HOME", id: "home" },
    { name: "ABOUT", id: "about" },
    { name: "COURSES", id: "courses" },
    { name: "PRICING", id: "pricing" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0b121f]/95 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl"
          : "bg-transparent"
      }`}
    >
      {/* Gradient glow effect */}
      {isScrolled && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 pointer-events-none"></div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => scrollToSection("home")}
          >
            <div className="relative">
              {/* Glowing background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>

              {/* Logo container */}
              <div className="relative  p-2.5 rounded-xl">
                <img
                  src="/macksofy_white.png"
                  alt={"course image"}
                  className="w-full size-7 h-10 object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-gray-400 text-xs font-medium -mt-1">
                Master Cybersecurity
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.id)}
                className="relative px-5 py-2 rounded-lg font-semibold text-sm tracking-wide text-gray-300 hover:text-white transition-all duration-300 group"
              >
                {/* Hover effect */}
                <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10">{item.name}</span>
              </button>
            ))}
          </div>

          {/* Right Section - CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 rounded-lg font-semibold text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="group relative px-6 py-2.5 rounded-lg font-semibold text-sm text-white overflow-hidden"
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>

              <span className="relative z-10"> CREATE ACCOUNT</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
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
              className="text-white"
            >
              {isMobileMenuOpen ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800/50 bg-[#0b121f]/95 backdrop-blur-xl rounded-b-2xl">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.id)}
                  className="px-4 py-3 rounded-lg font-semibold text-sm text-left text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  {item.name}
                </button>
              ))}

              {/* Mobile CTA Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-800/50 space-y-2">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full px-4 py-3 rounded-lg font-semibold text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="w-full px-4 py-3 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  CREATE ACCOUNT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default HomeNav;
