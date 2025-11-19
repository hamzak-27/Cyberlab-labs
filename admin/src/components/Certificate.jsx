import React from 'react';

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 2V6M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IdIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="8" cy="12" r="2.5" stroke="currentColor" strokeWidth="2"/>
    <path d="M13 10H19M13 14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SkillIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Certificate = ({ cert, onDownload, onShare, onVerify }) => {
  const banner = {
    background: `linear-gradient(120deg, ${cert.badgeColor}22, ${cert.badgeColor}11), url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop') center/cover`
  };

  const score = Math.max(0, Math.min(100, cert.score || 0));
  const circumference = 2 * Math.PI * 42;
  const dash = (score / 100) * circumference;

  return (
    <div className="cert-card">
      <div className="cert-banner" style={banner}>
        <div className="ribbon" style={{ background: cert.badgeColor }}>Verified</div>
        <div className="badge" style={{ borderColor: cert.badgeColor }}>
          <span className="dot" style={{ background: cert.badgeColor }} />
          <span>{cert.level}</span>
        </div>
      </div>

      <div className="cert-content">
        <div className="cert-header">
          <h3 className="cert-title">{cert.title}</h3>
          <div className="score-ring" title={`Score: ${score}%`}>
            <svg width="96" height="96" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#eee" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={cert.badgeColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference - dash}`}
                transform="rotate(-90 50 50)"
              />
              <text x="50" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill="#333">{score}%</text>
            </svg>
          </div>
        </div>

        <div className="cert-meta">
          <div className="meta"><CalendarIcon /> {new Date(cert.issueDate).toLocaleDateString()}</div>
          <div className="meta"><IdIcon /> {cert.credentialId}</div>
          <div className="skills"><SkillIcon /> {cert.skills.join(' • ')}</div>
        </div>

        <div className="cert-actions">
          <button className="btn ghost" onClick={onVerify}><span>Verify</span> <ArrowRight /></button>
          <button className="btn light" onClick={onShare}><span>Share</span></button>
          <button className="btn primary" onClick={onDownload}><span>Download</span></button>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
