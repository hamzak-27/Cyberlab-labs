import React from 'react';
import PropTypes from 'prop-types';
import './PathCard.css';

// Clock icon for estimated time
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="time-icon">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Module icon for modules count
const ModuleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="modules-icon">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// User icon for users count
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="users-icon">
    <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21V19C22.9986 17.1771 21.7079 15.5857 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13C17.7105 3.58385 19.0031 5.17926 19.0031 7.005C19.0031 8.83074 17.7105 10.4261 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Certificate icon for certification
const CertificateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="certificate-icon">
    <rect x="3" y="2" width="18" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 18L10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 18L14 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PathCard = ({ path }) => {
  // Calculate the progress bar width based on path progress
  const progressWidth = `${path.progress}%`;
  
  // Create a fallback image pattern based on the path category with cybersecurity themed elements
  const getFallbackImage = (category, title = '') => {
    const categoryColors = {
      'Offensive': '#FF5A5A',
      'Defensive': '#5A9FFF',
      'General': '#9AE62E'
    };
    const color = categoryColors[category] || '#9AE62E';
    
    // Generate a consistent but unique hue shift based on the title
    let hueShift = 0;
    if (title) {
      for (let i = 0; i < title.length; i++) {
        hueShift += title.charCodeAt(i);
      }
      hueShift = (hueShift % 40) - 20; // Range between -20 and +20 degrees
    }
    
    // Get category-specific icon
    let categoryIcon = '';
    if (category === 'Offensive') {
      // Target/Attack icon for Offensive
      categoryIcon = `%3Cpath d='M300 100C382.5 100 450 167.5 450 250C450 332.5 382.5 400 300 400C217.5 400 150 332.5 150 250C150 167.5 217.5 100 300 100Z' fill='none' stroke='${color.replace('#', '%23')}' stroke-width='6' stroke-dasharray='15,10' /%3E%3Cpath d='M300 150C355 150 400 195 400 250C400 305 355 350 300 350C245 350 200 305 200 250C200 195 245 150 300 150Z' fill='none' stroke='${color.replace('#', '%23')}' stroke-width='4' /%3E%3Cpath d='M300 200C327.5 200 350 222.5 350 250C350 277.5 327.5 300 300 300C272.5 300 250 277.5 250 250C250 222.5 272.5 200 300 200Z' fill='${color.replace('#', '%23')}' fill-opacity='0.2' stroke='${color.replace('#', '%23')}' stroke-width='3' /%3E%3Cline x1='300' y1='100' x2='300' y2='400' stroke='${color.replace('#', '%23')}' stroke-width='2' stroke-opacity='0.5' /%3E%3Cline x1='150' y1='250' x2='450' y2='250' stroke='${color.replace('#', '%23')}' stroke-width='2' stroke-opacity='0.5' /%3E`;
    } else if (category === 'Defensive') {
      // Shield icon for Defensive
      categoryIcon = `%3Cpath d='M300 120L430 180V280C430 330 370 380 300 400C230 380 170 330 170 280V180L300 120Z' fill='none' stroke='${color.replace('#', '%23')}' stroke-width='8' /%3E%3Cpath d='M260 250L285 275L340 220' stroke='${color.replace('#', '%23')}' stroke-width='10' stroke-linecap='round' stroke-linejoin='round' /%3E%3Cpath d='M300 150C320 160 360 180 360 180V260C360 290 330 320 300 330C270 320 240 290 240 260V180C240 180 280 160 300 150Z' fill='${color.replace('#', '%23')}' fill-opacity='0.1' /%3E`;
    } else {
      // Globe/Network icon for General
      categoryIcon = `%3Ccircle cx='300' cy='250' r='120' fill='none' stroke='${color.replace('#', '%23')}' stroke-width='6' /%3E%3Cellipse cx='300' cy='250' rx='120' ry='60' fill='none' stroke='${color.replace('#', '%23')}' stroke-width='3' /%3E%3Cpath d='M180 250H420' stroke='${color.replace('#', '%23')}' stroke-width='3' /%3E%3Cpath d='M300 130V370' stroke='${color.replace('#', '%23')}' stroke-width='3' /%3E%3Ccircle cx='300' cy='250' r='30' fill='${color.replace('#', '%23')}' fill-opacity='0.2' stroke='${color.replace('#', '%23')}' stroke-width='3' /%3E%3Ccircle cx='240' cy='200' r='15' fill='${color.replace('#', '%23')}' fill-opacity='0.2' stroke='${color.replace('#', '%23')}' stroke-width='2' /%3E%3Ccircle cx='360' cy='280' r='15' fill='${color.replace('#', '%23')}' fill-opacity='0.2' stroke='${color.replace('#', '%23')}' stroke-width='2' /%3E`;
    }
    
    // Create a binary pattern in the background
    const binaryPattern = `%3Ctext font-family='monospace' font-size='12' fill='${color.replace('#', '%23')}' fill-opacity='0.1' x='50' y='50'>01101001 01101110 01110100 01110010 01110101 01100100 01100101 01110010 00100000 01100100 01100101 01110100 01100101 01100011 01110100 01100101 01100100%3C/text%3E%3Ctext font-family='monospace' font-size='12' fill='${color.replace('#', '%23')}' fill-opacity='0.1' x='50' y='70'>01100110 01101001 01110010 01100101 01110111 01100001 01101100 01101100 00100000 01100010 01110010 01100101 01100001 01100011 01101000 00100000 01100001 01110100 01110100 01100101 01101101 01110000 01110100%3C/text%3E%3Ctext font-family='monospace' font-size='12' fill='${color.replace('#', '%23')}' fill-opacity='0.1' x='50' y='90'>01110011 01100101 01100011 01110101 01110010 01101001 01110100 01111001 00100000 01110000 01110010 01101111 01110100 01101111 01100011 01101111 01101100 00100000 01101001 01101110 01101001 01110100 01101001 01100001 01110100 01100101 01100100%3C/text%3E`;
    
    // Grid pattern 
    const gridPattern = `%3Cpath d='M0 0L600 0L600 400L0 400Z' fill='%230E1726' /%3E%3Cpath d='M0 80L600 80M0 160L600 160M0 240L600 240M0 320L600 320' stroke='${color.replace('#', '%23')}' stroke-width='1' stroke-opacity='0.1' /%3E%3Cpath d='M120 0L120 400M240 0L240 400M360 0L360 400M480 0L480 400' stroke='${color.replace('#', '%23')}' stroke-width='1' stroke-opacity='0.1' /%3E`;
    
    // Create a shortened title for display
    let displayTitle = title;
    if (displayTitle.length > 20) {
      displayTitle = displayTitle.substring(0, 20) + '...';
    }
    
    // Return a sophisticated SVG with cybersecurity elements
    return `data:image/svg+xml,%3Csvg width='600' height='400' viewBox='0 0 600 400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%230E1726'/%3E${gridPattern}${binaryPattern}${categoryIcon}%3Ctext x='300' y='350' font-family='Arial' font-size='18' font-weight='bold' text-anchor='middle' fill='${color.replace('#', '%23')}'%3E${displayTitle ? displayTitle : category + ' Path'}%3C/text%3E%3C/svg%3E`;
  };
  
  // Determine badge color and difficulty meter based on level
  const getBadgeClass = (level) => {
    switch (level) {
      case 'Beginner':
        return 'badge-beginner';
      case 'Intermediate':
        return 'badge-intermediate';
      case 'Advanced':
        return 'badge-advanced';
      default:
        return 'badge-beginner';
    }
  };
  
  // Create difficulty meter based on level
  const getDifficultyMeter = (level) => {
    let filled, empty, color;
    
    switch (level) {
      case 'Beginner':
        filled = 1;
        empty = 4;
        color = '#9ae62e';
        break;
      case 'Intermediate':
        filled = 3;
        empty = 2;
        color = '#5a9fff';
        break;
      case 'Advanced':
        filled = 5;
        empty = 0;
        color = '#ff5a5a';
        break;
      default:
        filled = 1;
        empty = 4;
        color = '#9ae62e';
    }
    
    return { filled, empty, color };
  };

  // Path category icon with consistent styling
  const CategoryIcon = ({ category }) => {
    if (category === 'Offensive') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="category-icon offensive">
          <path d="M12 2L19 9V15L12 22L5 15V9L12 2Z" stroke="#FF5A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" fill="rgba(255,90,90,0.2)" stroke="#FF5A5A" strokeWidth="2"/>
          <path d="M12 4L16 8M12 4L8 8" stroke="#FF5A5A" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round"/>
        </svg>
      );
    } else if (category === 'Defensive') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="category-icon defensive">
          <path d="M12 2L20 7V13C20 17.4183 16.4183 21 12 21C7.58172 21 4 17.4183 4 13V7L12 2Z" stroke="#5A9FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 6C13.5 7 17 8.5 17 8.5V13C17 15 14.7614 17 12 17.5C9.23858 17 7 15 7 13V8.5C7 8.5 10.5 7 12 6Z" fill="rgba(90,159,255,0.2)" stroke="none"/>
          <path d="M9 12L11 14L15 10" stroke="#5A9FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="category-icon general">
          <circle cx="12" cy="12" r="10" stroke="#9AE62E" strokeWidth="2"/>
          <circle cx="12" cy="12" r="5" fill="rgba(154,230,46,0.2)" stroke="#9AE62E" strokeWidth="1.5"/>
          <path d="M12 6V12L16 16" stroke="#9AE62E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12H6M18 12H22M12 2V6M12 18V22" stroke="#9AE62E" strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round"/>
        </svg>
      );
    }
  };

  return (
    <div className="path-card">
      <div className="path-image" style={{ backgroundImage: `url(${path.image || getFallbackImage(path.category, path.title)})` }}>
        <div className="path-overlay">
          <div className={`path-level ${getBadgeClass(path.level)}`}>
            {path.level}
          </div>
          {path.featured && <div className="featured-badge">Featured</div>}
        </div>
      </div>
      
      <div className="path-content">
        <div className={`path-category ${path.category.toLowerCase()}`}>
          <CategoryIcon category={path.category} />
          <span>{path.category}</span>
        </div>
        
        <h3 className="path-title">{path.title}</h3>
        
        {/* Difficulty meter */}
        <div className="difficulty-meter">
          <span className="difficulty-label">Difficulty:</span>
          <div className="difficulty-bars">
            {(() => {
              const { filled, empty, color } = getDifficultyMeter(path.level);
              return (
                <>
                  {[...Array(filled)].map((_, i) => (
                    <div key={`filled-${i}`} className="bar filled" style={{ backgroundColor: color }}></div>
                  ))}
                  {[...Array(empty)].map((_, i) => (
                    <div key={`empty-${i}`} className="bar empty"></div>
                  ))}
                </>
              );
            })()}
          </div>
        </div>
        
        <p className="path-description">{path.description}</p>
        
        <div className="path-stats">
          <div className="stat">
            <ModuleIcon />
            <span>{path.moduleCount} Modules</span>
          </div>
          <div className="stat">
            <ClockIcon />
            <span>{path.estimatedTime}</span>
          </div>
          <div className="stat">
            <UsersIcon />
            <span>{path.studentsCount.toLocaleString()} Students</span>
          </div>
          {path.certification && (
            <div className="stat certification">
              <CertificateIcon />
              <span>Certification</span>
            </div>
          )}
        </div>
        
        <div className="path-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: progressWidth }}></div>
          </div>
          <div className="progress-text" data-status={
            path.progress === 0 ? 'Not Started' : 
            path.progress === 100 ? 'Completed' : 
            'In Progress'
          }>
            {path.progress}% Complete
          </div>
        </div>
        
        <div className="path-actions">
          <button className="start-btn">
            {path.progress > 0 ? 'Continue' : 'Start Path'}
          </button>
          <button className="favorite-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

PathCard.propTypes = {
  path: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    level: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    progress: PropTypes.number.isRequired,
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
    moduleCount: PropTypes.number.isRequired,
    estimatedTime: PropTypes.string.isRequired,
    studentsCount: PropTypes.number.isRequired,
    certification: PropTypes.bool.isRequired,
    featured: PropTypes.bool
  }).isRequired
};

export default PathCard;