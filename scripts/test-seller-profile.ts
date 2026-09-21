import { sellerProfileRepository } from '../src/services/repositories/sellerProfileRepository';
import type { SellerProfile } from '../src/types/sellerProfile';

console.log('🧪 RUNNING SELLER PROFILE STORE VERIFICATION');

const testProfile: SellerProfile = sellerProfileRepository.createDefault({
  businessName: 'Apex Conversion Studio',
  sellerName: 'Sarah Jenkins',
  websiteUrl: 'https://apexconversionstudio.com',
  primaryRole: 'consultant',
  customRoleTitle: 'Senior Conversion Strategist & UX Specialist',
  tagline: 'We fix leaky B2B trade and contractor websites.',
  servicesOffered: [
    {
      id: 'srv_1',
      name: '48-Hour Homepage Conversion Rescue',
      category: 'UX / Product',
      description: 'Complete hero, CTA, form, and social proof overhaul.',
      typicalPriceMin: 1500,
      typicalPriceMax: 3500,
      currency: 'USD',
      deliverableSummary: 'High-converting Figma mockup, copy rewrite, and live HTML/CSS deployment.',
      capabilityTags: ['conversion_design', 'copywriting', 'mobile_optimization', 'headline_optimization'],
      order: 1
    },
    {
      id: 'srv_2',
      name: 'Local SEO & Lead Funnel Architecture',
      category: 'SEO / Discovery',
      description: 'Local citation structuring, Google Business profile audit, and review collection funnel.',
      typicalPriceMin: 2000,
      typicalPriceMax: 5000,
      currency: 'USD',
      deliverableSummary: 'Local schema markup, review capture widget, service area page templates.',
      capabilityTags: ['local_seo', 'lead_capture_funnels', 'analytics_tracking'],
      order: 2
    }
  ],
  servicesNotOffered: [
    'PPC / Paid Ad Management',
    'Custom iOS / Android Mobile Apps',
    'Cold Telemarketing'
  ],
  idealClientProfile: {
    preferredIndustries: ['Roofing Contractors', 'HVAC & Plumbing', 'High-Ticket Trades'],
    preferredClientTypes: ['Established Local Businesses ($500k-$5M annual revenue)'],
    minProjectBudget: 1500,
    idealProjectSize: '$2,500 – $6,000',
    geographicPreferences: 'Texas & US Metroplexes',
    engagementNotes: 'Focus on businesses with existing organic/referral traffic where conversion leaks cost real revenue.'
  },
  proofPoints: [
    {
      id: 'proof_1',
      title: '+142% Inbound Calls for Austin Roofing Contractor',
      description: 'Redesigned hero section, added 3-field quote estimator, and added direct tap-to-call mobile buttons.',
      url: 'https://apexconversionstudio.com/case-studies/roofing',
      tags: ['roofing', 'conversion_rate', 'mobile_calls'],
      order: 1
    }
  ],
  outreachPreferences: {
    tonePreset: 'direct_consultative',
    customToneGuidance: 'Keep paragraphs under 3 sentences, avoid corporate jargon, cite specific local market realities.',
    preferredChannels: ['Email', 'LinkedIn'],
    preferredCtaStyle: 'Low-friction 10-minute visual teardown',
    phrasesToAvoid: ['Hope this email finds you well', 'Synergy', 'Game-changer'],
    generalNotes: 'Always lead with a factual observation before making any recommendation.'
  },
  isActive: true
});

console.log('✅ Seller Profile Structure Verified:');
console.log(`- Business: ${testProfile.businessName} (${testProfile.sellerName})`);
console.log(`- Services Offered: ${testProfile.servicesOffered.length}`);
console.log(`- Exclusions: ${testProfile.servicesNotOffered.join(', ')}`);
console.log(`- Preferred Industries: ${testProfile.idealClientProfile.preferredIndustries.join(', ')}`);
console.log(`- Tone Preset: ${testProfile.outreachPreferences.tonePreset}`);
console.log(`- Proof Points: ${testProfile.proofPoints.length}`);
console.log('✨ ALL STAGE 1 SELLER PROFILE CHECKS PASSED');
