import React from 'react';
import { brandingConfig } from '../../config/brandingConfig';
import {
  LayoutDashboard,
  Building2,
  SlidersHorizontal,
  BookOpen,
  FolderOpen,
  PlusCircle,
  CheckSquare,
  Wrench,
  TrendingUp,
  Database,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'companies'
  | 'seller_profile'
  | 'framework'
  | 'diagnosis'
  | 'audits'
  | 'new_audit'
  | 'checklist'
  | 'rescue_kit'
  | 'sales_page';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  auditCount: number;
  onOpenBackup: () => void;
  includeDemo: boolean;
  onToggleIncludeDemo: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  auditCount,
  onOpenBackup,
  includeDemo,
  onToggleIncludeDemo
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'companies' as NavTab, label: 'Companies Directory', icon: Building2, highlight: false },
    { id: 'audits' as NavTab, label: 'Diagnostic Audits', icon: FolderOpen, badge: auditCount.toString() },
    { id: 'new_audit' as NavTab, label: 'New Audit', icon: PlusCircle, highlight: true },
    { id: 'seller_profile' as NavTab, label: 'My Business Profile', icon: Briefcase, highlight: false },
    { id: 'framework' as NavTab, label: 'Scoring Framework', icon: SlidersHorizontal },
    { id: 'diagnosis' as NavTab, label: 'Diagnosis Library', icon: BookOpen },
    { id: 'checklist' as NavTab, label: 'Free Checklist', icon: CheckSquare },
    { id: 'rescue_kit' as NavTab, label: 'Rescue Kit', icon: Wrench },
    { id: 'sales_page' as NavTab, label: 'Sales Page', icon: TrendingUp }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-badge">
          <div className="brand-icon">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.1 }}>ContextMuse</div>
            <div className="brand-subtitle">Audit System</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
              style={item.highlight ? { color: 'var(--accent-primary)', fontWeight: 700 } : undefined}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem' }}>
          <input
            type="checkbox"
            checked={includeDemo}
            onChange={(e) => onToggleIncludeDemo(e.target.checked)}
          />
          <span>Include Demo in Metrics</span>
        </label>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'flex-start', gap: '8px' }}
          onClick={onOpenBackup}
        >
          <Database size={14} />
          <span>Backup & Migration</span>
        </button>

        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
          {brandingConfig.tagline}
        </div>
      </div>
    </aside>
  );
};
