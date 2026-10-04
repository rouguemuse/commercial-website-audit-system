import React, { useState, useEffect } from 'react';
import { brandingConfig } from '../../config/brandingConfig';
import { PlusCircle, Sun, Moon, Menu, Lock } from 'lucide-react';

interface HeaderProps {
  onStartAudit: () => void;
  frameworkVersion: string;
  onOpenBranding?: () => void;
  onLoadDemoAudit?: () => void;
  onToggleMobileNav?: () => void;
  onOpenAuthUnlock?: () => void;
  authStatus?: { authRequired: boolean; authenticated: boolean };
}

export const Header: React.FC<HeaderProps> = ({
  onStartAudit,
  frameworkVersion,
  onOpenBranding,
  onLoadDemoAudit,
  onToggleMobileNav,
  onOpenAuthUnlock,
  authStatus
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('agency_theme_mode') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('agency_theme_mode', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {onToggleMobileNav && (
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={onToggleMobileNav}
            aria-label="Toggle navigation menu"
          >
            <Menu size={18} />
          </button>
        )}
        <span className="hide-mobile" style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          {brandingConfig.appName}
        </span>
        <span className="badge badge-neutral hide-mobile" style={{ fontSize: '0.72rem' }}>
          Framework v{frameworkVersion}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onLoadDemoAudit && (
          <button
            type="button"
            className="btn btn-secondary btn-sm hide-mobile"
            onClick={onLoadDemoAudit}
            title="Load ready-made fictional demo audit"
            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'var(--accent-border)', color: 'var(--accent-text)' }}
          >
            <span>⚡ Load Demo Audit</span>
          </button>
        )}

        {onOpenBranding && (
          <button
            type="button"
            className="btn btn-secondary btn-sm hide-mobile"
            onClick={onOpenBranding}
            title="Configure white-label agency name, logo, colors and contact"
            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🎨 Agency Branding</span>
          </button>
        )}

        {authStatus?.authRequired && !authStatus?.authenticated && onOpenAuthUnlock && (
          <button
            type="button"
            className="btn btn-secondary btn-sm badge-rose"
            onClick={onOpenAuthUnlock}
            title="Unlock production access with server passphrase"
            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Lock size={14} />
            <span>Unlock</span>
          </button>
        )}

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
