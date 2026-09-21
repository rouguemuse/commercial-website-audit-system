export interface AgencyBranding {
  agencyName: string;
  tagline: string;
  logoUrl: string;
  email: string;
  phone: string;
  website: string;
  primaryColor: string;
  accentColor: string;
  reportTitle: string;
}

export const DEFAULT_AGENCY_BRANDING: AgencyBranding = {
  agencyName: 'Apex Digital Systems',
  tagline: 'High-Impact Website Conversion & UX Audits',
  logoUrl: '',
  email: 'audits@apexdigital.example.com',
  phone: '(555) 234-5678',
  website: 'https://apexdigital.example.com',
  primaryColor: '#0f172a',
  accentColor: '#2563eb',
  reportTitle: 'Website Conversion & Usability Audit'
};

const STORAGE_KEY = 'agency_whitelabel_branding_v1';

export function getAgencyBranding(): AgencyBranding {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_AGENCY_BRANDING, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load agency branding from localStorage', e);
  }
  return { ...DEFAULT_AGENCY_BRANDING };
}

export function saveAgencyBranding(branding: AgencyBranding): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
    applyBrandingTheme(branding);
  } catch (e) {
    console.error('Failed to save agency branding to localStorage', e);
  }
}

export function resetToDemoBranding(): AgencyBranding {
  try {
    localStorage.removeItem(STORAGE_KEY);
    applyBrandingTheme(DEFAULT_AGENCY_BRANDING);
  } catch (e) {
    console.error('Failed to reset agency branding', e);
  }
  return { ...DEFAULT_AGENCY_BRANDING };
}

export function applyBrandingTheme(branding?: AgencyBranding): void {
  const b = branding || getAgencyBranding();
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (b.primaryColor) {
      root.style.setProperty('--agency-primary', b.primaryColor);
    }
    if (b.accentColor) {
      root.style.setProperty('--agency-accent', b.accentColor);
      root.style.setProperty('--accent-primary', b.accentColor);
    }
  }
}

// Backward compatibility helper
export const brandingConfig = {
  get appName() { return `${getAgencyBranding().agencyName} Audit Suite`; },
  get shortName() { return getAgencyBranding().agencyName; },
  get companyName() { return getAgencyBranding().agencyName; },
  get tagline() { return getAgencyBranding().tagline; },
  frameworkVersionDefault: '1.0',
  get reportTitle() { return getAgencyBranding().reportTitle; },
  get supportEmail() { return getAgencyBranding().email; },
  get website() { return getAgencyBranding().website; },
  currencySymbol: '$',
  get footerMetadataTemplate() {
    return `${getAgencyBranding().reportTitle} • ${getAgencyBranding().agencyName} • Evaluation Framework {version} • {date}`;
  }
};
