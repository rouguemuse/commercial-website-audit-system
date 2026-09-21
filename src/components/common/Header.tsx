import React, { useState, useEffect } from 'react';
import { brandingConfig } from '../../config/brandingConfig';
import { PlusCircle, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onStartAudit: () => void;
  frameworkVersion: string;
}

export const Header: React.FC<HeaderProps> = ({ onStartAudit, frameworkVersion }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('contextmuse_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('contextmuse_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          {brandingConfig.appName}
        </span>
        <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
          Framework v{frameworkVersion}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Theme Toggle Button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          <span style={{ fontSize: '0.78rem' }}>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onStartAudit}
        >
          <PlusCircle size={15} />
          <span>New Audit</span>
        </button>
      </div>
    </header>
  );
};
