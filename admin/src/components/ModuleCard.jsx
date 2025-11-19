import React from 'react';
import './ModuleCard.css';

const ModuleCard = ({ module }) => {
  // Calculate the progress bar width based on module progress
  const progressWidth = `${module.progress}%`;
  
  // Determine badge color based on difficulty
  const getBadgeClass = (difficulty) => {
    switch (difficulty) {
      case 'Fundamental':
        return 'badge-fundamental';
      case 'Easy':
        return 'badge-easy';
      case 'Medium':
        return 'badge-medium';
      case 'Hard':
        return 'badge-hard';
      default:
        return 'badge-fundamental';
    }
  };

  // Module category icon
  const CategoryIcon = ({ category }) => {
    if (category === 'Offensive') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="category-icon offensive">
          <path d="M12 2L19 9V15L12 22L5 15V9L12 2Z" stroke="#FF5A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="#FF5A5A" strokeWidth="2"/>
        </svg>
      );
    } else if (category === 'Defensive') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="category-icon defensive">
          <path d="M12 2L20 7V13C20 17.4183 16.4183 21 12 21C7.58172 21 4 17.4183 4 13V7L12 2Z" stroke="#5A9FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12L11 14L15 10" stroke="#5A9FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="category-icon general">
          <circle cx="12" cy="12" r="10" stroke="#9AE62E" strokeWidth="2"/>
          <path d="M12 6V12L16 16" stroke="#9AE62E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
  };

  // Clock icon for estimated time
  const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="time-icon">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="module-card">
      <div className="module-image" style={{ backgroundImage: `url(${module.image || '/module-images/default.jpg'})` }}>
        <div className="module-overlay">
          <div className={`module-difficulty ${getBadgeClass(module.difficulty)}`}>
            {module.difficulty}
          </div>
        </div>
      </div>
      
      <div className="module-content">
        <div className="module-category">
          <CategoryIcon category={module.category} />
          <span>{module.category}</span>
        </div>
        
        <h3 className="module-title">{module.title}</h3>
        
        <p className="module-description">{module.description}</p>
        
        <div className="module-meta">
          <div className="module-time">
            <ClockIcon />
            <span>{module.estimatedTime}</span>
          </div>
          
          <div className="module-tags">
            {module.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
            {module.tags.length > 2 && <span className="tag-more">+{module.tags.length - 2}</span>}
          </div>
        </div>
        
        <div className="module-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: progressWidth }}></div>
          </div>
          <span className="progress-text">{module.progress}% Complete</span>
        </div>
        
        <div className="module-actions">
          <button className="start-btn">
            {module.progress > 0 ? 'Continue' : 'Start'}
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

export default ModuleCard;