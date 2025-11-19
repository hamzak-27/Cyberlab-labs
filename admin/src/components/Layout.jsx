import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Layout.css";

// SVG Icon Components - Cybersecurity themed
const LogoIcon = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 3L4 12L18 21L32 12L18 3Z"
      fill="#0E1726"
      stroke="#9AE62E"
      strokeWidth="2"
    />
    <path d="M4 16L18 25L32 16" stroke="#9AE62E" strokeWidth="2" />
    <path d="M4 20L18 29L32 20" stroke="#9AE62E" strokeWidth="2" />
    <circle cx="18" cy="12" r="4" fill="#9AE62E" opacity="0.2" />
  </svg>
);

const DashboardIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="3"
      width="7"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="14"
      y="3"
      width="7"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="3"
      y="14"
      width="7"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="14"
      y="14"
      width="7"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M7 7L14 14"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M17 7L10 14"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const ModuleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M8 8H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 12H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 16H12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="18" cy="6" r="2" fill="#5A9FFF" />
  </svg>
);

const PathsIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 4V17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 7V20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LabsIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 3H15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 3V8L5 16V21H19V16L14 8V3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 16H19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="13" r="1" fill="currentColor" />
    <circle cx="14" cy="13" r="1" fill="currentColor" />
  </svg>
);

const CertificateIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="2"
      width="18"
      height="20"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="2" />
    <path
      d="M8 18L10 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16 18L14 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M10 10L12 12L15 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BadgeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L14 8H21L16 12L18 18L12 14L6 18L8 12L3 8H10L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const InviteIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
    <path
      d="M9 6V9H12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 15L16 18M16 18L19 21M16 18L19 15M16 18L13 21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const JobIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="8"
      width="18"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M8 8V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 12V16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="1.5" stroke="currentColor" />
  </svg>
);

const CtfIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 4H20V8C20 8 17 10 12 10C7 10 4 8 4 8V4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 8V16C4 16 7 18 12 18C17 18 20 16 20 16V8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 18V22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 22H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 8L11 10L15 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BusinessIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 22H23"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect
      x="3"
      y="10"
      width="18"
      height="12"
      stroke="currentColor"
      strokeWidth="2"
      rx="1"
    />
    <path
      d="M6 10V6C6 4.89543 6.89543 4 8 4H16C17.1046 4 18 4.89543 18 6V10"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M9 16H15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 12H15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 4V2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const HomeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 12H3L12 3L21 12H19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 12V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 21V15H14V21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CubeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 3L4 7V17L12 21L20 17V7L12 3Z"
      stroke="#9AE62E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 7L12 11L20 7"
      stroke="#9AE62E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 11V21"
      stroke="#9AE62E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="layout-container overflow-y-scroll">
      {/* Mobile Header with Hamburger */}
      <div className="mobile-header">
        <div className="mobile-logo">
          <div className="logo-icon">
            <LogoIcon />
          </div>
          <h1>
            CYBER <span>ACADEMY</span>
          </h1>
        </div>
        <button
          className="hamburger-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span
            className={`hamburger-line ${isMobileMenuOpen ? "open" : ""}`}
          ></span>
          <span
            className={`hamburger-line ${isMobileMenuOpen ? "open" : ""}`}
          ></span>
          <span
            className={`hamburger-line ${isMobileMenuOpen ? "open" : ""}`}
          ></span>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="logo desktop-only">
          <div className="logo-icon">
            <LogoIcon />
          </div>
          <h1>
            CYBER <span>ACADEMY</span>
          </h1>
        </div>

        <div className="user-profile-sidebar">
          <div className="user-avatar">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="User avatar"
            />
          </div>
          <div className="username">John Doe</div>
          <div className="user-plan">Free</div>
          <div className="cube-count">
            <CubeIcon /> 60
          </div>
        </div>

        <div className="sidebar-section">
          <h3>LEARN</h3>
          <ul>
            <li className={location.pathname === "/dashboard" ? "active" : ""}>
              <Link to="/dashboard">
                <DashboardIcon /> Dashboard
              </Link>
            </li>
            <li className={location.pathname === "/modules" ? "active" : ""}>
              <Link to="/modules">
                <ModuleIcon /> Modules
              </Link>
            </li>
            <li className={location.pathname === "/paths" ? "active" : ""}>
              <Link to="/paths">
                <PathsIcon /> Learning Paths
              </Link>{" "}
              <span className="new-badge">NEW</span>
            </li>
            <li>
              <LabsIcon /> Practice Labs
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <h3>MY ACHIEVEMENTS</h3>
          <ul>
            <li
              className={location.pathname === "/certificates" ? "active" : ""}
            >
              <Link to="/certificates">
                <CertificateIcon /> My Certificates
              </Link>
            </li>
            <li className={location.pathname === "/badges" ? "active" : ""}>
              <Link to="/badges">
                <BadgeIcon /> My Badges
              </Link>
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <h3>REFERRALS</h3>
          <ul>
            <li>
              <InviteIcon /> Invite friends{" "}
              <span className="new-badge">NEW</span>
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <h3>ECOSYSTEM</h3>
          <ul>
            <li>
              <JobIcon /> Security Jobs
            </li>
            <li>
              <LabsIcon /> Security Labs
            </li>
            <li>
              <CtfIcon /> CTF Events
            </li>
            <li>
              <BusinessIcon /> Enterprise Solutions
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <h3>NAVIGATION</h3>
          <ul>
            <li>
              <Link to="/">
                <HomeIcon /> Back to Home
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
      )}

      {/* Main content */}
      <div className="main-content">{children}</div>

      {/* Floating buttons */}
      <button className="chat-btn">💬</button>
      <button className="getting-started-btn">
        <span className="icon">?</span> Getting Started
      </button>
    </div>
  );
};

export default Layout;
