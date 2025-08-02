import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'QuillBot Flow', icon: '✍️' },
    { path: '/enhanced-paraphraser', label: 'Literary Paraphraser', icon: '🎨' },
    { path: '/grammar-checker', label: 'Grammar Pro', icon: '📝' },
    { path: '/character-assistant', label: 'Character Dev', icon: '👥' },
    { path: '/plot-analyzer', label: 'Plot Structure', icon: '📊' },
    { path: '/manuscript-manager', label: 'Manuscript Manager', icon: '📖' },
    { path: '/scene-builder', label: 'Scene Builder', icon: '🎪' },
    { path: '/readability-optimizer', label: 'Readability', icon: '📊' },
    { path: '/summarizer', label: 'Summarizer', icon: '📄' },
    { path: '/tone-analyzer', label: 'Tone Analyzer', icon: '🎭' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>Stefano De Almanos</h1>
      </div>
      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link 
              to={item.path} 
              className={location.pathname === item.path ? 'active' : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;