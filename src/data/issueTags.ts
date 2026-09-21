import type { IssueTag } from '../types';

export const GLOBAL_ISSUE_TAGS: IssueTag[] = [
  // Category: Clarity
  { id: 'tag_vague', name: 'Vague', category: 'Clarity', description: 'Imprecise phrasing lacking concrete specifics.' },
  { id: 'tag_ambiguous', name: 'Ambiguous', category: 'Clarity', description: 'Could mean multiple things, forcing visitor guesswork.' },
  { id: 'tag_generic', name: 'Generic', category: 'Clarity', description: 'Filler copy that could apply to any competitor.' },
  { id: 'tag_unclear', name: 'Unclear', category: 'Clarity', description: 'Meaning or core offer is difficult to comprehend.' },
  { id: 'tag_too_broad', name: 'Too broad', category: 'Clarity', description: 'Covers too many disjointed topics at once.' },
  { id: 'tag_missing_context', name: 'Missing context', category: 'Clarity', description: 'Lacks background details needed to evaluate.' },
  { id: 'tag_requires_interpretation', name: 'Requires interpretation', category: 'Clarity', description: 'Forces the visitor to interpret before understanding.' },

  // Category: Hierarchy / Visibility
  { id: 'tag_buried', name: 'Buried', category: 'Hierarchy', description: 'Hidden deep in sub-pages or footer.' },
  { id: 'tag_easy_to_miss', name: 'Easy to miss', category: 'Hierarchy', description: 'Lacks visual contrast or prominent placement.' },
  { id: 'tag_below_the_fold', name: 'Below the fold', category: 'Hierarchy', description: 'Essential proof or next step is hidden off-screen.' },
  { id: 'tag_competing', name: 'Competing', category: 'Hierarchy', description: 'Multiple elements of equal weight fighting for attention.' },
  { id: 'tag_visually_weak', name: 'Visually weak', category: 'Hierarchy', description: 'Under-styled, washed out, or low contrast.' },
  { id: 'tag_poor_hierarchy', name: 'Poor hierarchy', category: 'Hierarchy', description: 'Eye does not know where to look first.' },
  { id: 'tag_too_dense', name: 'Too dense', category: 'Hierarchy', description: 'Intimidating wall of text or crammed layout.' },
  { id: 'tag_cluttered', name: 'Cluttered', category: 'Hierarchy', description: 'Overloaded with non-essential banners or widgets.' },

  // Category: Consistency
  { id: 'tag_conflicting', name: 'Conflicting', category: 'Consistency', description: 'Different parts of the site contradict each other.' },
  { id: 'tag_inconsistent', name: 'Inconsistent', category: 'Consistency', description: 'Varying terminology or layouts across pages.' },
  { id: 'tag_repetitive', name: 'Repetitive', category: 'Consistency', description: 'Saying the same vague point multiple times.' },
  { id: 'tag_terminology_mismatch', name: 'Terminology mismatch', category: 'Consistency', description: 'Uses internal jargon unfamiliar to buyers.' },
  { id: 'tag_cta_mismatch', name: 'CTA mismatch', category: 'Consistency', description: 'Button label does not match destination action.' },

  // Category: Missing Elements
  { id: 'tag_missing', name: 'Missing', category: 'Missing Elements', description: 'Crucial element is completely absent.' },
  { id: 'tag_incomplete', name: 'Incomplete', category: 'Missing Elements', description: 'Started but left unfinished or thin.' },
  { id: 'tag_unsupported', name: 'Unsupported', category: 'Missing Elements', description: 'Bold claim made with zero substantiating evidence.' },
  { id: 'tag_no_proof', name: 'No proof', category: 'Missing Elements', description: 'Zero reviews, ratings, or third-party validation.' },
  { id: 'tag_no_next_step', name: 'No next step', category: 'Missing Elements', description: 'Dead end leaving the user wondering what to do.' },
  { id: 'tag_no_location_context', name: 'No location context', category: 'Missing Elements', description: 'Geographic service territory is unstated.' },

  // Category: Conversion
  { id: 'tag_friction', name: 'Friction', category: 'Conversion', description: 'Unnecessary effort required to complete an action.' },
  { id: 'tag_too_many_choices', name: 'Too many choices', category: 'Conversion', description: 'Analysis paralysis caused by excess options.' },
  { id: 'tag_unclear_next_step', name: 'Unclear next step', category: 'Conversion', description: 'User does not know what clicking the button will do.' },
  { id: 'tag_high_commitment', name: 'High commitment too early', category: 'Conversion', description: 'Demanding heavy commitment before value is shown.' },
  { id: 'tag_form_friction', name: 'Form friction', category: 'Conversion', description: 'Too many fields, confusing inputs, or captcha blocks.' },
  { id: 'tag_dead_end', name: 'Dead end', category: 'Conversion', description: 'Page terminates with no obvious path forward.' },

  // Category: Trust
  { id: 'tag_weak_credibility', name: 'Weak credibility', category: 'Trust', description: 'Site looks questionable or unprofessional.' },
  { id: 'tag_stock_proof', name: 'Stock/generic proof', category: 'Trust', description: 'Fake-looking or generic stock photos used as proof.' },
  { id: 'tag_unverified_claim', name: 'Unverified claim', category: 'Trust', description: 'Self-serving claims without verifiable proof.' },
  { id: 'tag_missing_social_proof', name: 'Missing social proof', category: 'Trust', description: 'No customer testimonials or reviews visible.' },
  { id: 'tag_missing_identity', name: 'Missing business identity', category: 'Trust', description: 'No physical location, names, or contact verification.' },

  // Category: UX
  { id: 'tag_mobile_issue', name: 'Mobile issue', category: 'UX', description: 'Layout breaks, cutoffs, or misalignments on phones.' },
  { id: 'tag_readability', name: 'Readability', category: 'UX', description: 'Poor contrast, tiny fonts, or awkward line height.' },
  { id: 'tag_navigation_friction', name: 'Navigation friction', category: 'UX', description: 'Hard to find pages or confusing menu hierarchy.' },
  { id: 'tag_excessive_scrolling', name: 'Excessive scrolling', category: 'UX', description: 'Buried content requiring endless scrolling.' },
  { id: 'tag_interaction_issue', name: 'Interaction issue', category: 'UX', description: 'Buttons too small to tap, broken links, or sluggish widgets.' },

  // Category: Copy Naturalness & Voice (Synthetic/AI Cadence Detection)
  { id: 'tag_formulaic_phrasing', name: 'Formulaic phrasing', category: 'Voice', description: 'Canned copy patterns that sound auto-generated.' },
  { id: 'tag_ai_contrast', name: 'AI-style contrast', category: 'Voice', description: '"It\'s not just X, it\'s Y" or "This isn\'t about X, it\'s about Y".' },
  { id: 'tag_emdash_overuse', name: 'Em-dash overuse', category: 'Voice', description: 'Unnatural sentence fragment — em dash — dramatic payoff rhythm.' },
  { id: 'tag_fragmented_cadence', name: 'Fragmented cadence', category: 'Voice', description: 'Over-dramatized chopped sentences ending in neat mic-drop lines.' },
  { id: 'tag_generic_marketing', name: 'Generic marketing language', category: 'Voice', description: 'Corporate fluff without concrete trade facts or human personality.' },
  { id: 'tag_over_polished', name: 'Over-polished', category: 'Voice', description: 'Sterile copy stripped of authentic human voice and local flavor.' },
  { id: 'tag_repetitive_structure', name: 'Repetitive sentence structure', category: 'Voice', description: 'Suspiciously uniform sentence lengths and symmetrical phrasing.' },
  { id: 'tag_abstract_wording', name: 'Abstract wording', category: 'Voice', description: 'Abstractions like "solutions", "seamless", "empowering", "tailored".' },
  { id: 'tag_brand_voice_mismatch', name: 'Brand voice mismatch', category: 'Voice', description: 'Sounds like generic agency copy instead of the real business owner.' },
  { id: 'tag_unnatural_list', name: 'Unnatural list cadence', category: 'Voice', description: 'Forced three-part lists or "From X to Y" filler constructions.' },
  { id: 'tag_cliche_cta', name: 'Cliché CTA language', category: 'Voice', description: 'Trite slogans like "Ready to elevate your experience?".' }
];

export function getIssueTagColor(category: IssueTag['category']): { bg: string; text: string; border: string } {
  switch (category) {
    case 'Clarity':
      return { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' };
    case 'Hierarchy':
      return { bg: '#fdf2f8', text: '#9d174d', border: '#fbcfe8' };
    case 'Consistency':
      return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
    case 'Missing Elements':
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
    case 'Conversion':
      return { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' };
    case 'Trust':
      return { bg: '#fefce8', text: '#854d0e', border: '#fef08a' };
    case 'UX':
      return { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' };
    case 'Voice':
      return { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' };
    default:
      return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
  }
}
