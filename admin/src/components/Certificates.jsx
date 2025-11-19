import React, { useMemo, useState } from 'react';
import './Certificates.css';
import Certificate from './Certificate';
import Layout from './Layout';

// Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 17C13.866 17 17 13.866 17 10C17 6.134 13.866 3 10 3 6.134 3 3 6.134 3 10c0 3.866 3.134 7 7 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21 15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4h16v3l-6 6v6l-4 2v-8L4 7V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


// Sample data
const certificates = [
  {
    id: 1,
    title: 'Penetration Tester (PT-101)',
    issuer: 'Cyber Academy',
    issueDate: '2025-02-18',
    credentialId: 'CA-PT101-9XZ42',
    skills: ['Pentesting', 'Web', 'Linux'],
    level: 'Intermediate',
    score: 86,
    badgeColor: '#e31837',
    image: null,
    verifyUrl: '#'
  },
  {
    id: 2,
    title: 'SOC Analyst (SOC-1)',
    issuer: 'Cyber Academy',
    issueDate: '2025-07-02',
    credentialId: 'CA-SOC1-713AA',
    skills: ['SIEM', 'Detection', 'Triage'],
    level: 'Beginner',
    score: 92,
    badgeColor: '#0a1323',
    image: null,
    verifyUrl: '#'
  },
  {
    id: 3,
    title: 'Cloud Security Specialist',
    issuer: 'Cyber Academy',
    issueDate: '2025-04-09',
    credentialId: 'CA-CLOUD-55K2Q',
    skills: ['AWS', 'IAM', 'KMS'],
    level: 'Advanced',
    score: 78,
    badgeColor: '#c41230',
    image: null,
    verifyUrl: '#'
  }
];

const levelOptions = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const Certificates = () => {
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const firstIssuedYear = useMemo(() => {
    if (!certificates.length) return '-';
    return Math.min(...certificates.map(c => new Date(c.issueDate).getFullYear()));
  }, []);

  const filtered = useMemo(() => {
    return certificates.filter(c => {
      const term = search.trim().toLowerCase();
      const matchesTerm = !term || c.title.toLowerCase().includes(term) || c.issuer.toLowerCase().includes(term) || c.skills.some(s => s.toLowerCase().includes(term)) || c.credentialId.toLowerCase().includes(term);
      const matchesLevel = level === 'All' || c.level === level;
      return matchesTerm && matchesLevel;
    });
  }, [search, level]);

  return (
    <Layout>
      <div className="certs-container">
        <div className="certs-header">
          <div className="certs-header-content">
            <h1>CERTIFICATES</h1>
            <div className="breadcrumbs">
              <span>Pages</span> <span className="separator">/</span> <span className="current">Certificates</span>
            </div>
            <p>Showcase and verify your earned credentials. Download, share, and validate certificates backed by Cyber Academy.</p>
            <div className="certs-stats">
              <div className="stat">
                <span className="value">{certificates.length}</span>
                <span className="label">Certificates</span>
              </div>
              <div className="stat">
                <span className="value">{Math.round(certificates.reduce((a,c)=>a+c.score,0)/certificates.length)}%</span>
                <span className="label">Avg Score</span>
              </div>
              <div className="stat">
                <span className="value">{firstIssuedYear}</span>
                <span className="label">First Issued</span>
              </div>
            </div>
          </div>
        </div>

        <div className="certs-search-filter-container">
          <div className="certs-search-filter">
            <div className="search-bar">
              <SearchIcon />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search certificates, IDs, skills..." />
            </div>
            <button className="filter-btn" onClick={()=>setShowFilters(v=>!v)}>
              <FilterIcon /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filters-header">
              <h3>Filters</h3>
              <button className="clear-btn" onClick={()=>{setSearch(''); setLevel('All');}}>Clear All</button>
            </div>
            <div className="filters-grid">
              <div className="filter-group">
                <label>Level</label>
                <div className="filter-options">
                  {levelOptions.map(opt => (
                    <button key={opt} className={level===opt? 'active':''} onClick={()=>setLevel(opt)}>{opt}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="results-count">
          <span>Found <strong>{filtered.length}</strong> certificates</span>
        </div>

        <div className="certs-grid">
          {filtered.map(c => (
            <Certificate key={c.id} cert={c} onDownload={()=>{}} onShare={()=>{}} onVerify={()=>{ window.open(c.verifyUrl,'_blank'); }} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Certificates;
