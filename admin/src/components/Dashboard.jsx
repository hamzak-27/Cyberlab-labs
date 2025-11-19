import React from 'react';
import './Dashboard.css';
import Layout from './Layout';
const LogoIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 3L4 12L18 21L32 12L18 3Z" fill="#0E1726" stroke="#9AE62E" strokeWidth="2" />
    <path d="M4 16L18 25L32 16" stroke="#9AE62E" strokeWidth="2" />
    <path d="M4 20L18 29L32 20" stroke="#9AE62E" strokeWidth="2" />
    <circle cx="18" cy="12" r="4" fill="#9AE62E" opacity="0.2" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const NotificationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C9 2 6 3 6 9C6 12.5 4 14 4 14H20C20 14 18 12.5 18 9C18 3 15 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="17" cy="6" r="3" fill="#FF4B55" stroke="none"/>
  </svg>
);

const CubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L4 7V17L12 21L20 17V7L12 3Z" stroke="#9AE62E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 7L12 11L20 7" stroke="#9AE62E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11V21" stroke="#9AE62E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    <path d="M7 7L14 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M17 7L10 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

const ModuleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="18" cy="6" r="2" fill="#5A9FFF"/>
  </svg>
);

const PathsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 4V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 7V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LabsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 3V8L5 16V21H19V16L14 8V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 16H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="13" r="1" fill="currentColor"/>
    <circle cx="14" cy="13" r="1" fill="currentColor"/>
  </svg>
);

const CertificateIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="2" width="18" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 18L10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 18L14 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 10L12 12L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BadgeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14 8H21L16 12L18 18L12 14L6 18L8 12L3 8H10L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const InviteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 6V9H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 15L16 18M16 18L19 21M16 18L19 15M16 18L13 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const JobIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 8V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="1.5" stroke="currentColor"/>
  </svg>
);

const CtfIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H20V8C20 8 17 10 12 10C7 10 4 8 4 8V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 8V16C4 16 7 18 12 18C17 18 20 16 20 16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 8L11 10L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BusinessIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 22H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <rect x="3" y="10" width="18" height="12" stroke="currentColor" strokeWidth="2" rx="1"/>
    <path d="M6 10V6C6 4.89543 6.89543 4 8 4H16C17.1046 4 18 4.89543 18 6V10" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H3L12 3L21 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 21V15H14V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L14.6346 8.56806L21 9.69629L16.5 13.9917L17.7639 20L12 17.153L6.23607 20L7.5 13.9917L3 9.69629L9.36539 8.56806L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const ReferIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15C12 15 4 15 4 19V21H20V19C20 15 12 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 8L22 11L19 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlanIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12V15C2 16.0609 2.42143 17.0783 3.17157 17.8284C3.92172 18.5786 4.93913 19 6 19H18C19.0609 19 20.0783 18.5786 20.8284 17.8284C21.5786 17.0783 22 16.0609 22 15V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 5C6 3.89543 6.89543 3 8 3H16C17.1046 3 18 3.89543 18 5V19C18 17.8954 17.1046 17 16 17H8C6.89543 17 6 17.8954 6 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 10L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 7L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 13L12 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CompletedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const Dashboard = () => {
  return (
    <Layout>
      <div className="dashboard-main">
        {/* Top bar */}
        <div className="top-bar">
          <div className="search-bar">
            <SearchIcon />
            <input type="text" placeholder="Search modules, labs, paths..." />
          </div>
          <div className="top-bar-actions">
            <button className="notification-btn">
              <NotificationIcon />
            </button>
            <button className="upgrade-btn">
              <CubeIcon /> Purchase Cubes
            </button>
            <div className="user-profile">
              <div className="avatar">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
              </div>
              <span className="username">John <span className="user-dropdown">▼</span></span>
            </div>
          </div>
        </div>
        
        {/* Dashboard header */}
        <div className="dashboard-header">
          <h1>DASHBOARD</h1>
          <div className="breadcrumbs">
            <span>Pages</span> <span className="separator">/</span> <span className="current">Dashboard</span>
          </div>
        </div>
        
        {/* Dashboard content */}
        <div className="dashboard-content">
          {/* Progress circles */}
          <div className="progress-section">
            <div className="progress-circle offensive" style={{'--progress': '0%'}}>
              <div className="progress-track"></div>
              <div className="progress-percentage">0.00%</div>
              <div className="progress-label">Offensive</div>
            </div>
            <div className="progress-circle defensive" style={{'--progress': '0%'}}>
              <div className="progress-track"></div>
              <div className="progress-percentage">0.00%</div>
              <div className="progress-label">Defensive</div>
            </div>
            <div className="progress-circle general" style={{'--progress': '0%'}}>
              <div className="progress-track"></div>
              <div className="progress-percentage">0.00%</div>
              <div className="progress-label">General</div>
            </div>
          </div>
          
          {/* Modules section */}
          <div className="modules-section">
            <div className="section-header">
              <h2>
                <StarIcon /> Favorite Modules List
              </h2>
            </div>
            <div className="modules-table">
              <div className="table-header">
                <div className="col name">Name</div>
                <div className="col progress">Progress</div>
                <div className="col difficulty">Difficulty</div>
                <div className="col actions"></div>
              </div>
              <div className="table-row">
                <div className="col name">
                  <div className="module-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="#5A9FFF" strokeWidth="2" />
                      <path d="M8 12H16" stroke="#5A9FFF" strokeWidth="2" strokeLinecap="round" />
                      <path d="M12 8V16" stroke="#5A9FFF" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <a href="#">Intro to Cybersecurity</a>
                </div>
                <div className="col progress">0%</div>
                <div className="col difficulty">
                  <span className="badge fundamental">Fundamental</span>
                </div>
                <div className="col actions">
                  <button className="start-btn">Start</button>
                </div>
              </div>
              
              <div className="table-row">
                <div className="col name">
                  <div className="module-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#5A9FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12H22" stroke="#5A9FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2V2Z" stroke="#5A9FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <a href="#">Network Security</a>
                </div>
                <div className="col progress">0%</div>
                <div className="col difficulty">
                  <span className="badge easy">Easy</span>
                </div>
                <div className="col actions">
                  <button className="start-btn">Start</button>
                </div>
              </div>
              
              <div className="table-row">
                <div className="col name">
                  <div className="module-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 11C20 15.4183 16.4183 19 12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3C16.4183 3 20 6.58172 20 11Z" stroke="#FF5A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 3V11L16 15" stroke="#FF5A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 22V19" stroke="#FF5A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <a href="#">Web Application Pentesting</a>
                </div>
                <div className="col progress">0%</div>
                <div className="col difficulty">
                  <span className="badge medium">Medium</span>
                </div>
                <div className="col actions">
                  <button className="start-btn">Start</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Side panels */}
          <div className="side-panels">
            <div className="panel weekly-streak">
              <h2>Weekly Streak <span className="beta-badge">BETA</span></h2>
              <div className="this-week">This Week</div>
              <div className="streak-count">
                <span className="big-count">0</span>
                <span className="streak-total">/ 30 pts</span>
              </div>
              <div className="streak-dots">
                <div className="streak-dot"></div>
                <div className="streak-dot"></div>
                <div className="streak-dot"></div>
                <div className="streak-dot"></div>
                <div className="streak-dot"></div>
                <div className="streak-dot"></div>
                <div className="streak-dot"></div>
              </div>
            </div>
            
            <div className="panel referral">
              <div className="panel-decoration"></div>
              <h2>
                <ReferIcon /> Refer a friend
              </h2>
              <p>Refer a Friend, Earn Cubes, Unlock Academy Modules!</p>
              <button className="start-referring-btn">Start Referring</button>
            </div>
            
            <div className="panel my-plan">
              <div className="panel-decoration"></div>
              <h2>
                <PlanIcon /> My Plan
              </h2>
              <button className="subscribe-btn">
                <CheckIcon /> Subscribe now!
              </button>
            </div>
            
            <div className="panel completed-paths">
              <h2>
                <CompletedIcon /> Completed Paths
              </h2>
              <div className="none-status"><span className="emoji">😢</span> None</div>
            </div>
            
            <div className="panel completed-modules">
              <h2>
                <CompletedIcon /> Completed Modules
              </h2>
              <div className="none-status"><span className="emoji">😢</span> None</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;