import React, { useMemo, useState } from 'react';
import './Badges.css';
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

// Sample data (Hack The Box–like categories/rarities)
const allBadges = [
	{ id: 1, title: 'Recon Rookie', category: 'Learning', level: 'Beginner', rarity: 'Common', color: '#e31837', icon: '🔎', date: '2025-03-12' },
	{ id: 2, title: 'Privilege Escalator', category: 'Offensive', level: 'Intermediate', rarity: 'Rare', color: '#0a1323', icon: '🧗', date: '2025-05-02' },
	{ id: 3, title: 'Blue Team Beacon', category: 'Defensive', level: 'Beginner', rarity: 'Uncommon', color: '#c41230', icon: '🛡️', date: '2025-06-22' },
	{ id: 4, title: 'Cloud Climber', category: 'Cloud', level: 'Advanced', rarity: 'Epic', color: '#e31837', icon: '☁️', date: '2025-04-18' },
	{ id: 5, title: 'Crypto Sleuth', category: 'Research', level: 'Intermediate', rarity: 'Uncommon', color: '#0a1323', icon: '🧩', date: '2025-07-01' },
];

const rarityOptions = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
const categoryOptions = ['All', 'Learning', 'Offensive', 'Defensive', 'Cloud', 'Research'];
const levelOptions = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const BadgeCard = ({ badge }) => (
	<div className="badge-card">
		<div className="badge-banner" style={{ background: `linear-gradient(120deg, ${badge.color}22, ${badge.color}11)` }}>
			<div className="rarity-chip" data-rarity={badge.rarity}>{badge.rarity}</div>
			<div className="badge-icon" style={{ color: badge.color }}>{badge.icon}</div>
		</div>
		<div className="badge-content">
			<h3 className="badge-title">{badge.title}</h3>
			<div className="badge-meta">
				<span className="pill" title="Category">{badge.category}</span>
				<span className="pill" title="Level">{badge.level}</span>
				<span className="pill muted" title="Date">{new Date(badge.date).toLocaleDateString()}</span>
			</div>
			<div className="badge-actions">
				<button className="btn ghost">View</button>
				<button className="btn light">Share</button>
				<button className="btn primary">Showcase</button>
			</div>
		</div>
	</div>
);

const Badges = () => {
	const [search, setSearch] = useState('');
	const [rarity, setRarity] = useState('All');
	const [category, setCategory] = useState('All');
	const [level, setLevel] = useState('All');
	const [showFilters, setShowFilters] = useState(false);

	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();
		return allBadges.filter(b => {
			const matchesTerm = !term || b.title.toLowerCase().includes(term) || b.category.toLowerCase().includes(term) || b.level.toLowerCase().includes(term) || b.rarity.toLowerCase().includes(term);
			const matchesRarity = rarity === 'All' || b.rarity === rarity;
			const matchesCategory = category === 'All' || b.category === category;
			const matchesLevel = level === 'All' || b.level === level;
			return matchesTerm && matchesRarity && matchesCategory && matchesLevel;
		});
	}, [search, rarity, category, level]);

	const stats = useMemo(() => ({
		total: allBadges.length,
		rare: allBadges.filter(b => ['Rare','Epic','Legendary'].includes(b.rarity)).length,
		newest: allBadges.reduce((acc,b)=> acc && new Date(acc) > new Date(b.date) ? acc : b.date, null)
	}), []);

	return (
		<Layout>
			<div className="badges-container">
				<div className="badges-header">
					<h1>BADGES</h1>
					<div className="breadcrumbs"><span>Pages</span> <span className="separator">/</span> <span className="current">Badges</span></div>
					<p>Collect, showcase, and flex your achievements. Filter by rarity, track progress, and curate your profile like on Hack The Box.</p>
					<div className="badges-stats">
						<div className="stat"><span className="value">{stats.total}</span><span className="label">Total</span></div>
						<div className="stat"><span className="value">{stats.rare}</span><span className="label">Rare+</span></div>
					</div>
				</div>

				<div className="badges-search-filter-container">
					<div className="badges-search-filter">
						<div className="search-bar">
							<SearchIcon />
							<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search badges, rarity, category..." />
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
							<button className="clear-btn" onClick={()=>{ setSearch(''); setRarity('All'); setCategory('All'); setLevel('All'); }}>Clear All</button>
						</div>
						<div className="filters-grid">
							<div className="filter-group">
								<label>Rarity</label>
								<div className="filter-options">
									{rarityOptions.map(opt => (
										<button key={opt} className={rarity===opt? 'active':''} onClick={()=>setRarity(opt)}>{opt}</button>
									))}
								</div>
							</div>
							<div className="filter-group">
								<label>Category</label>
								<div className="filter-options">
									{categoryOptions.map(opt => (
										<button key={opt} className={category===opt? 'active':''} onClick={()=>setCategory(opt)}>{opt}</button>
									))}
								</div>
							</div>
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

				<div className="results-count">Found <strong>{filtered.length}</strong> badges</div>

				<div className="badges-grid">
					{filtered.map(b => (
						<BadgeCard key={b.id} badge={b} />
					))}
				</div>
			</div>
		</Layout>
	);
};

export default Badges;

