/**
 * Seller & Agency Capability Profile Data Model for Commercial Website Audit System
 */

export type ServiceCategory =
  | 'Strategy'
  | 'UX / Product'
  | 'Design'
  | 'Development'
  | 'Automation'
  | 'AI'
  | 'Copy / Messaging'
  | 'SEO / Discovery'
  | 'Operations / Systems'
  | 'Marketing'
  | 'Consulting'
  | 'Other';

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Strategy',
  'UX / Product',
  'Design',
  'Development',
  'Automation',
  'AI',
  'Copy / Messaging',
  'SEO / Discovery',
  'Operations / Systems',
  'Marketing',
  'Consulting',
  'Other'
];

export type SellerRole =
  | 'freelancer'
  | 'consultant'
  | 'agency'
  | 'developer'
  | 'designer'
  | 'builder'
  | 'other';

export interface ServiceOffering {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  typicalPriceMin?: number;
  typicalPriceMax?: number;
  currency: string;
  deliverableSummary: string;
  capabilityTags: string[];
  order: number;
}

export interface ProofPoint {
  id: string;
  title: string;
  description: string;
  url?: string;
  tags?: string[];
  order: number;
}

export interface IdealClientProfile {
  preferredIndustries: string[];
  preferredClientTypes: string[];
  minProjectBudget?: number;
  idealProjectSize?: string;
  geographicPreferences?: string;
  engagementNotes?: string;
}

export type OutreachTonePreset =
  | 'direct_consultative'
  | 'peer_specialist'
  | 'plainspoken_operator'
  | 'warm_strategic'
  | 'custom';

export interface OutreachPreferences {
  tonePreset: OutreachTonePreset;
  customToneGuidance?: string;
  preferredChannels: string[]; // e.g. ['Email', 'LinkedIn', 'Phone / Cold Call', 'Loom / Video']
  preferredCtaStyle?: string; // e.g. "Low-friction conversation / 10-min review"
  phrasesToAvoid: string[]; // e.g. ["Hope this email finds you well", "Synergy", "Transformative"]
  generalNotes?: string;
}

export interface SellerProfile {
  id: string; // e.g. 'seller_profile_primary'
  sellerName: string;
  businessName: string;
  websiteUrl?: string;
  primaryRole: SellerRole;
  customRoleTitle?: string;
  tagline?: string;
  servicesOffered: ServiceOffering[];
  servicesNotOffered: string[]; // Explicit exclusions
  idealClientProfile: IdealClientProfile;
  proofPoints: ProofPoint[];
  outreachPreferences: OutreachPreferences;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SuggestedCapabilityTag {
  id: string;
  label: string;
  category: string;
}

export const SUGGESTED_CAPABILITY_TAGS: SuggestedCapabilityTag[] = [
  { id: 'conversion_design', label: 'Conversion Design', category: 'Design' },
  { id: 'ui_ux_design', label: 'UI / UX Design', category: 'Design' },
  { id: 'mobile_optimization', label: 'Mobile Optimization', category: 'Design' },
  { id: 'copywriting', label: 'Direct Response Copywriting', category: 'Copy' },
  { id: 'brand_messaging', label: 'Brand Voice & Messaging', category: 'Copy' },
  { id: 'headline_optimization', label: 'Hero & Headline Strategy', category: 'Copy' },
  { id: 'frontend_development', label: 'Frontend Development', category: 'Dev' },
  { id: 'react_development', label: 'React / Next.js Development', category: 'Dev' },
  { id: 'fullstack_development', label: 'Full-Stack Development', category: 'Dev' },
  { id: 'speed_performance', label: 'Page Speed & Core Web Vitals', category: 'Dev' },
  { id: 'lead_capture_funnels', label: 'Lead Capture & Funnels', category: 'Strategy' },
  { id: 'conversion_architecture', label: 'Conversion Architecture', category: 'Strategy' },
  { id: 'pricing_strategy', label: 'Pricing & Offer Structuring', category: 'Strategy' },
  { id: 'local_seo', label: 'Local SEO & Google Business', category: 'SEO' },
  { id: 'technical_seo', label: 'Technical SEO', category: 'SEO' },
  { id: 'workflow_automation', label: 'Workflow & CRM Automation', category: 'Automation' },
  { id: 'ai_integration', label: 'AI Workflow Integration', category: 'AI' },
  { id: 'analytics_tracking', label: 'Analytics & Event Tracking', category: 'Analytics' },
  { id: 'e_commerce_cro', label: 'E-Commerce Checkout & CRO', category: 'E-Commerce' }
];
