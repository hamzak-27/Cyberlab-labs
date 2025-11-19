import React, { useState } from 'react';
import './Paths.css';
import PathCard from './PathCard';
import Layout from './Layout';

// SVG Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H20V7L14 13V19L10 21V13L4 7V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Sample paths data - would come from API in production
const pathsData = [
  {
    id: 1,
    title: "Penetration Testing Pathway",
    description: "A comprehensive learning path to become a professional penetration tester.",
    level: "Intermediate",
    category: "Offensive",
    progress: 15,
    // Using null to trigger the fallback image generation
    image: null, 
    moduleCount: 12,
    estimatedTime: "60 hours",
    studentsCount: 12450,
    certification: true,
    featured: true,
    tags: ["pentesting", "offensive", "certification"]
  },
  {
    id: 2,
    title: "SOC Analyst Career Path",
    description: "Learn the essential skills needed to become a Security Operations Center analyst.",
    level: "Beginner",
    category: "Defensive",
    progress: 0,
    image: null, // Using null to trigger the fallback image generation
    moduleCount: 8,
    estimatedTime: "45 hours",
    studentsCount: 9820,
    certification: true,
    featured: false,
    tags: ["soc", "defensive", "monitoring"]
  },
  {
    id: 3,
    title: "Web Application Security",
    description: "Master techniques to identify and exploit web vulnerabilities and secure web applications.",
    level: "Advanced",
    category: "Offensive",
    progress: 30,
    image: null, // Using null to trigger the fallback image generation
    moduleCount: 10,
    estimatedTime: "55 hours",
    studentsCount: 7645,
    certification: true,
    featured: true,
    tags: ["web", "owasp", "offensive"]
  },
  {
    id: 4,
    title: "Incident Response Path",
    description: "Learn how to efficiently respond to and manage security incidents in an organization.",
    level: "Intermediate",
    category: "Defensive",
    progress: 0,
    image: null, // Using null to trigger the fallback image generation
    moduleCount: 7,
    estimatedTime: "40 hours",
    studentsCount: 5280,
    certification: true,
    featured: false,
    tags: ["incident response", "defensive", "forensics"]
  },
  {
    id: 5,
    title: "Cybersecurity Fundamentals",
    description: "A beginner-friendly introduction to core cybersecurity concepts and practices.",
    level: "Beginner",
    category: "General",
    progress: 65,
    image: null, // Using null to trigger the fallback image generation
    moduleCount: 6,
    estimatedTime: "30 hours",
    studentsCount: 21450,
    certification: true,
    featured: false,
    tags: ["basics", "general", "introduction"]
  },
  {
    id: 6,
    title: "Cloud Security Specialist",
    description: "Learn how to secure cloud environments and infrastructure across major providers.",
    level: "Advanced",
    category: "Defensive",
    progress: 0,
    image: null, // Using null to trigger the fallback image generation
    moduleCount: 9,
    estimatedTime: "50 hours",
    studentsCount: 6325,
    certification: true,
    featured: true,
    tags: ["cloud", "aws", "azure", "defensive"]
  },
  {
    id: 7,
    title: "Malware Analysis Path",
    description: "Learn techniques to analyze and reverse engineer malware to understand their behavior.",
    level: "Advanced",
    category: "Defensive",
    progress: 0,
    image: null, // Using null to trigger the fallback image generation
    moduleCount: 8,
    estimatedTime: "48 hours",
    studentsCount: 4125,
    certification: false,
    featured: false,
    tags: ["malware", "reverse engineering", "defensive"]
  },
  {
    id: 8,
    title: "Red Team Operations",
    description: "Advanced tactics and techniques for simulating real-world targeted attacks.",
    level: "Advanced",
    category: "Offensive",
    progress: 0,
    image: null, // Using null to trigger the fallback image generation
    moduleCount: 10,
    estimatedTime: "65 hours",
    studentsCount: 3890,
    certification: true,
    featured: false,
    tags: ["red team", "offensive", "advanced"]
  }
];

const Paths = () => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [progressFilter, setProgressFilter] = useState('All');
  const [certificationFilter, setCertificationFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter paths based on user selections
  const filteredPaths = pathsData.filter(path => {
    // Search term filtering
    const matchesSearchTerm = path.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            path.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            path.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Category filtering
    const matchesCategory = categoryFilter === 'All' || path.category === categoryFilter;
    
    // Level filtering
    const matchesLevel = levelFilter === 'All' || path.level === levelFilter;
    
    // Progress filtering
    const matchesProgress = progressFilter === 'All' || 
                          (progressFilter === 'Completed' && path.progress === 100) ||
                          (progressFilter === 'In Progress' && path.progress > 0 && path.progress < 100) ||
                          (progressFilter === 'Not Started' && path.progress === 0);
    
    // Certification filtering
    const matchesCertification = certificationFilter === 'All' || 
                               (certificationFilter === 'With Certification' && path.certification) ||
                               (certificationFilter === 'No Certification' && !path.certification);
    
    return matchesSearchTerm && matchesCategory && matchesLevel && matchesProgress && matchesCertification;
  });
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setLevelFilter('All');
    setProgressFilter('All');
    setCertificationFilter('All');
  };
  
  // Featured paths section
  const featuredPaths = pathsData.filter(path => path.featured);
  
  return (
    <Layout>
      <div className="paths-container">
        {/* Enhanced Header section with animated elements */}
        <div className="paths-header">
          <div className="paths-header-content">
            <h1>LEARNING PATHS</h1>
            <div className="breadcrumbs">
              <span>Pages</span> <span className="separator">/</span> <span className="current">Learning Paths</span>
            </div>
            <p>Master cybersecurity skills through structured learning paths designed by industry experts. From offensive penetration testing to defensive SOC analysis, find the perfect path to advance your security career.</p>
            
            {/* Path stats counters with animated values */}
            <div className="path-stats-counter">
              <div className="stat-box">
                <span className="stat-value">{pathsData.length}</span>
                <span className="stat-label">Learning Paths</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{Math.max(...pathsData.map(path => path.moduleCount))}</span>
                <span className="stat-label">Max Modules</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{Math.ceil(pathsData.reduce((sum, path) => sum + parseInt(path.estimatedTime), 0) / pathsData.length)}</span>
                <span className="stat-label">Avg Hours</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured paths section - only show if we have featured paths */}
        {featuredPaths.length > 0 && (
          <div className="featured-paths">
            <h2>Featured Paths</h2>
            <div className="paths-grid featured">
              {featuredPaths.map(path => (
                <PathCard key={path.id} path={path} />
              ))}
            </div>
          </div>
        )}
        
        {/* Search and filter section - with container */}
        <div className="paths-search-filter-container">
          <div className="paths-search-filter">
            <div className="search-bar">
              <SearchIcon />
              <input 
                type="text" 
                placeholder="Search learning paths..." 
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button className="filter-btn" onClick={toggleFilters}>
              <FilterIcon /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>
        
        {/* Filters section - visible when showFilters is true */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-header">
              <h3>Filters</h3>
              <button className="clear-btn" onClick={clearFilters}>Clear All</button>
            </div>
            
            <div className="filters-grid">
              <div className="filter-group">
                <label>Category</label>
                <div className="filter-options">
                  {['All', 'Offensive', 'Defensive', 'General'].map(category => (
                    <button 
                      key={category}
                      className={categoryFilter === category ? 'active' : ''}
                      onClick={() => setCategoryFilter(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-group">
                <label>Level</label>
                <div className="filter-options">
                  {['All', 'Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <button 
                      key={level}
                      className={levelFilter === level ? 'active' : ''}
                      onClick={() => setLevelFilter(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-group">
                <label>Progress</label>
                <div className="filter-options">
                  {['All', 'Not Started', 'In Progress', 'Completed'].map(progress => (
                    <button 
                      key={progress}
                      className={progressFilter === progress ? 'active' : ''}
                      onClick={() => setProgressFilter(progress)}
                    >
                      {progress}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-group">
                <label>Certification</label>
                <div className="filter-options">
                  {['All', 'With Certification', 'No Certification'].map(cert => (
                    <button 
                      key={cert}
                      className={certificationFilter === cert ? 'active' : ''}
                      onClick={() => setCertificationFilter(cert)}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="selected-filters">
              {categoryFilter !== 'All' && (
                <div className="filter-tag">
                  Category: {categoryFilter}
                  <button onClick={() => setCategoryFilter('All')}><CloseIcon /></button>
                </div>
              )}
              {levelFilter !== 'All' && (
                <div className="filter-tag">
                  Level: {levelFilter}
                  <button onClick={() => setLevelFilter('All')}><CloseIcon /></button>
                </div>
              )}
              {progressFilter !== 'All' && (
                <div className="filter-tag">
                  Progress: {progressFilter}
                  <button onClick={() => setProgressFilter('All')}><CloseIcon /></button>
                </div>
              )}
              {certificationFilter !== 'All' && (
                <div className="filter-tag">
                  {certificationFilter}
                  <button onClick={() => setCertificationFilter('All')}><CloseIcon /></button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Enhanced paths results count */}
        <div className="results-count">
          <span>Found <strong>{filteredPaths.length}</strong> learning paths matching your criteria</span>
        </div>
        
        {/* All paths grid */}
        <div className="paths-section">
          <h2>All Learning Paths</h2>
          <div className="paths-grid">
            {filteredPaths.length > 0 ? (
              filteredPaths.map(path => (
                <PathCard key={path.id} path={path} />
              ))
            ) : (
              <div className="no-results">
                <p>No learning paths match your search criteria.</p>
                <button className="reset-btn" onClick={clearFilters}>Reset Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Paths;