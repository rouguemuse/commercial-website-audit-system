import type { MasterFramework, Diagnosis, Audit, ValueLadderOffer, AuditAsset, AuditScoreItem } from '../types';

export const VALUE_LADDER_OFFERS: ValueLadderOffer[] = [
  {
    id: 'offer_free',
    name: 'Business Website Checklist',
    price: 'Free',
    targetPrice: 0,
    badge: 'Lead Magnet',
    tagline: 'Self-serve 30-point evaluation for business owners.',
    deliverable: 'Interactive 30-check scorecard & DIY gap analysis.',
    turnaround: 'Instant',
    idealFor: 'Owners who want an immediate baseline check of their current site.',
    isPublicFunnel: true
  },
  {
    id: 'offer_kit',
    name: 'Website Rescue Kit',
    price: '$29',
    targetPrice: 29,
    badge: 'DIY Toolkit',
    tagline: '10-section actionable playbook to eliminate conversion leaks.',
    deliverable: 'Formulas, wireframe teardowns, and copy prompts.',
    turnaround: 'Instant Download',
    idealFor: 'DIY builders and small teams optimizing their own copy and layouts.',
    isPublicFunnel: false
  },
  {
    id: 'offer_checkup',
    name: 'Website Conversion Checkup',
    price: '$99',
    targetPrice: 99,
    badge: 'Diagnostic Report',
    tagline: 'Tell me exactly what is wrong and why visitors are bouncing.',
    deliverable: 'Comprehensive 30-point expert diagnostic report + prioritized action items.',
    turnaround: '24–48 Hours',
    idealFor: 'Businesses needing an objective expert review before redesigning.',
    isPublicFunnel: true
  },
  {
    id: 'offer_blueprint',
    name: 'Homepage Conversion Blueprint',
    price: '$149',
    targetPrice: 149,
    badge: 'Audit + Visual Direction',
    tagline: 'Tell me what is wrong and show me exactly what it should look like.',
    deliverable: 'Complete checkup report PLUS high-fidelity annotated Fixed Direction mockup.',
    turnaround: '3 Business Days',
    idealFor: 'Businesses wanting concrete visual proof and copy layout recommendations.',
    isPublicFunnel: true
  },
  {
    id: 'offer_rescue_48h',
    name: '48-Hour Homepage Rescue',
    price: '$350',
    targetPrice: 350,
    badge: 'Done-For-You',
    tagline: 'Fix it for me. Rapid implementation of the high-converting homepage.',
    deliverable: 'Direct homepage overhaul, high-converting hero, proof blocks, and streamlined CTA.',
    turnaround: '48 Hours',
    idealFor: 'Local businesses losing quote inquiries who need immediate turnarounds.',
    isPublicFunnel: true
  },
  {
    id: 'offer_starter_build',
    name: 'Starter Website Build',
    price: '$450+',
    targetPrice: 450,
    badge: 'Full Site Rebuild',
    tagline: 'Turnkey high-converting multi-page web presence for service pros.',
    deliverable: '3–5 core pages, mobile optimization, conversion flows, and SEO fundamentals.',
    turnaround: '1–2 Weeks',
    idealFor: 'Businesses with severely outdated websites requiring a clean structural reset.',
    isPublicFunnel: false
  },
  {
    id: 'offer_business_auto',
    name: 'Business / Automation Build',
    price: '$750+',
    targetPrice: 750,
    badge: 'Advanced System',
    tagline: 'Full conversion site integrated with automated CRM & booking flows.',
    deliverable: 'Custom site architecture, automated lead intake, booking engine, and notifications.',
    turnaround: '2–3 Weeks',
    idealFor: 'Established service businesses looking to automate customer inquiries end-to-end.',
    isPublicFunnel: false
  }
];

export const INITIAL_MASTER_FRAMEWORK: MasterFramework = {
  id: 'fw_v1.0',
  version: '1.0',
  updatedAt: new Date().toISOString(),
  categories: [
    {
      id: 'cat_clarity',
      number: 1,
      name: 'First Impression & Clarity',
      shortName: 'Clarity',
      description: 'Above-the-fold clarity, immediate value proposition, and 5-second comprehension.'
    },
    {
      id: 'cat_messaging',
      number: 2,
      name: 'Offer & Messaging',
      shortName: 'Offer & Messaging',
      description: 'Service explanation, customer-centric outcomes, and objection handling.'
    },
    {
      id: 'cat_conversion',
      number: 3,
      name: 'Conversion & CTA',
      shortName: 'Conversion & CTA',
      description: 'Primary calls to action, form friction, and low-resistance user journeys.'
    },
    {
      id: 'cat_trust',
      number: 4,
      name: 'Trust & Credibility',
      shortName: 'Trust & Credibility',
      description: 'Social proof, authentic visual evidence, credentials, and verification signals.'
    },
    {
      id: 'cat_mobile_ux',
      number: 5,
      name: 'Mobile & User Experience',
      shortName: 'Mobile & UX',
      description: 'Responsive layout integrity, typography readability, and navigation simplicity.'
    },
    {
      id: 'cat_seo',
      number: 6,
      name: 'Discoverability & Local SEO',
      shortName: 'Discoverability',
      description: 'Intentional site structure, local service indicators, and crawlable text.'
    }
  ],
  checks: [
    // Category 1: First Impression & Clarity
    {
      id: 'chk_1',
      categoryId: 'cat_clarity',
      number: 1,
      title: '5-Second Comprehension',
      evaluatorQuestion: 'Can a new visitor identify what the business offers within 5 seconds?',
      checklistQuestion: 'Can a brand-new visitor tell what your business offers in under 5 seconds?',
      scoringGuidance: {
        0: 'Completely ambiguous; relies on vague slogans (e.g. "Excellence in Motion") or uninformative imagery.',
        1: 'Requires scrolling or close reading of secondary paragraphs to understand the core service.',
        2: 'Crystal clear immediate comprehension above the fold without requiring any guesswork.'
      },
      isActive: true
    },
    {
      id: 'chk_2',
      categoryId: 'cat_clarity',
      number: 2,
      title: 'Hero Headline Outcome',
      evaluatorQuestion: 'Does the hero headline communicate the primary service or outcome?',
      checklistQuestion: 'Does your main headline clearly state your primary service or tangible customer outcome?',
      scoringGuidance: {
        0: 'No clear headline, or greeting filler like "Welcome to Our Website" or company-centric motto.',
        1: 'Mentions the general topic but is overly verbose, abstract, or lacks concrete outcome phrasing.',
        2: 'Strong, direct headline stating the exact service and tangible benefit for the customer.'
      },
      isActive: true
    },
    {
      id: 'chk_3',
      categoryId: 'cat_clarity',
      number: 3,
      title: 'Location & Service Area',
      evaluatorQuestion: 'Is the business location or service area clear when relevant?',
      checklistQuestion: 'Is your exact city, service area, or regional coverage immediately obvious?',
      scoringGuidance: {
        0: 'No geographic location or service region mentioned anywhere above the fold or on the homepage.',
        1: 'Location buried only in footer or contact sub-page; visitors are unsure if you serve their area.',
        2: 'Prominently displayed in hero or top banner (e.g. "Serving the Greater Dallas–Fort Worth Metro").'
      },
      isActive: true
    },
    {
      id: 'chk_4',
      categoryId: 'cat_clarity',
      number: 4,
      title: 'Above-the-Fold Visual Hierarchy',
      evaluatorQuestion: 'Does the page visually establish a clear hierarchy above the fold?',
      checklistQuestion: 'Is there an intuitive visual hierarchy guiding the eye smoothly above the fold?',
      scoringGuidance: {
        0: 'Chaotic layout, competing banners, giant non-functional image sliders, or misaligned blocks.',
        1: 'Moderate visual clutter; multiple elements competing for attention without clear primary focus.',
        2: 'Clean, intentional layout leading the eye from headline → value points → primary call to action.'
      },
      isActive: true
    },
    {
      id: 'chk_5',
      categoryId: 'cat_clarity',
      number: 5,
      title: 'Immediate Next Action',
      evaluatorQuestion: 'Does the visitor immediately understand what action to take next?',
      checklistQuestion: 'Is it instantly obvious what specific next step the visitor should take?',
      scoringGuidance: {
        0: 'No action indicated; visitor is left with a dead-end page or ambiguous choices.',
        1: 'Next step is implied but visually weak or muffled among numerous low-value links.',
        2: 'Prominent, unmistakable visual cue directing the visitor to the primary next step.'
      },
      isActive: true
    },

    // Category 2: Offer & Messaging
    {
      id: 'chk_6',
      categoryId: 'cat_messaging',
      number: 6,
      title: 'Primary Services Comprehension',
      evaluatorQuestion: 'Are primary services or products easy to understand at a glance?',
      checklistQuestion: 'Are your main services or product offerings easy to understand at a glance?',
      scoringGuidance: {
        0: 'Jargon-heavy, missing descriptions, or lumped together in one confusing wall of text.',
        1: 'Services are listed but lack clear differentiation, scope explanations, or customer context.',
        2: 'Clean, structured presentation breaking down core offerings with concise descriptions.'
      },
      isActive: true
    },
    {
      id: 'chk_7',
      categoryId: 'cat_messaging',
      number: 7,
      title: 'Unique Value Proposition',
      evaluatorQuestion: 'Does the site communicate why a customer should choose this business?',
      checklistQuestion: 'Does your site clearly explain why a customer should choose you over competitors?',
      scoringGuidance: {
        0: 'Generic claims only (e.g. "We provide good quality and honest service") without proof.',
        1: 'Some differentiation mentioned, but lacks specifics (e.g. speed, pricing guarantees, specialized gear).',
        2: 'Clear, compelling reasons to choose this business highlighted prominently with evidence.'
      },
      isActive: true
    },
    {
      id: 'chk_8',
      categoryId: 'cat_messaging',
      number: 8,
      title: 'Customer-Centric Outcomes',
      evaluatorQuestion: 'Does messaging focus on customer outcomes rather than company-centered filler?',
      checklistQuestion: 'Is your copy written around the customer’s goals rather than company-centric filler?',
      scoringGuidance: {
        0: 'Entirely "we/us" focused ("We were founded in 1998 with a dream...") without customer relevance.',
        1: 'Mixed copy; touches on benefits but reverts heavily into internal business jargon or biographies.',
        2: 'Directly addresses customer pain points, desired relief, and tangible positive outcomes.'
      },
      isActive: true
    },
    {
      id: 'chk_9',
      categoryId: 'cat_messaging',
      number: 9,
      title: 'Objection & Question Handling',
      evaluatorQuestion: 'Are important customer objections and questions proactively addressed?',
      checklistQuestion: 'Do you address the top doubts, questions, or objections buyers usually have?',
      scoringGuidance: {
        0: 'Zero objection handling; completely ignores common friction (timelines, sizing, permits, pricing).',
        1: 'Only a basic FAQ with generic questions that do not alleviate high-friction purchasing doubts.',
        2: 'Proactively addresses top questions (pricing models, speed, cancellation, guarantees) inline.'
      },
      isActive: true
    },
    {
      id: 'chk_10',
      categoryId: 'cat_messaging',
      number: 10,
      title: 'Pricing & Next-Step Expectations',
      evaluatorQuestion: 'Are offers, packages, pricing, or next-step expectations clear enough to reduce uncertainty?',
      checklistQuestion: 'Are your pricing ranges, package scopes, or consultation expectations clearly set?',
      scoringGuidance: {
        0: 'Total mystery pricing and unknown process, creating high friction for price-conscious buyers.',
        1: 'States "call for pricing" without explaining the quoting turnaround or what happens next.',
        2: 'Provides starting ranges, clear transparent package tables, or explicit "What to expect" steps.'
      },
      isActive: true
    },

    // Category 3: Conversion & CTA
    {
      id: 'chk_11',
      categoryId: 'cat_conversion',
      number: 11,
      title: 'Single Primary Conversion Action',
      evaluatorQuestion: 'Is there one obvious primary conversion action?',
      checklistQuestion: 'Is there one distinct, obvious primary action on every page?',
      scoringGuidance: {
        0: 'No primary CTA or a clutter of 5+ equal buttons ("Call", "Email", "Follow us", "Newsletter", "Chat").',
        1: 'Primary action exists but is visually diluted by competing secondary buttons of equal weight.',
        2: 'One standout primary CTA with high visual contrast that guides the visitor decisively.'
      },
      isActive: true
    },
    {
      id: 'chk_12',
      categoryId: 'cat_conversion',
      number: 12,
      title: 'Specific CTA Wording',
      evaluatorQuestion: 'Does CTA wording clearly communicate what happens next?',
      checklistQuestion: 'Do your buttons use action-oriented wording that tells users what happens next?',
      scoringGuidance: {
        0: 'Vague, low-intent labels like "Submit", "Click Here", or "Go".',
        1: 'Generic labels like "Learn More" or "Contact Us" that do not convey specific commitment.',
        2: 'High-intent, specific labels like "Get Your Instant Quote", "Check Dumpster Availability", "Book Inspection".'
      },
      isActive: true
    },
    {
      id: 'chk_13',
      categoryId: 'cat_conversion',
      number: 13,
      title: 'Strategic CTA Frequency',
      evaluatorQuestion: 'Do important CTAs appear at appropriate points throughout the page?',
      checklistQuestion: 'Are calls to action placed naturally throughout the page as visitors scroll?',
      scoringGuidance: {
        0: 'CTA only appears once in the header or at the very bottom of an endless page.',
        1: 'Inconsistent placement; long dead zones where an interested reader has no direct way to act.',
        2: 'Placed naturally after key value points, mid-page proof blocks, and in a sticky or recurring layout.'
      },
      isActive: true
    },
    {
      id: 'chk_14',
      categoryId: 'cat_conversion',
      number: 14,
      title: 'Low-Friction Forms',
      evaluatorQuestion: 'Do contact, quote, or booking forms ask only for information that is actually necessary?',
      checklistQuestion: 'Do your inquiry forms ask only for essential details without unnecessary fields?',
      scoringGuidance: {
        0: 'Excessive interrogation forms (10+ fields, fax, mailing address, captcha puzzles) causing drop-offs.',
        1: 'Contains several optional or prematurely intrusive questions before establishing mutual fit.',
        2: 'Streamlined, low-friction form (3–4 high-impact fields) allowing swift visitor submission.'
      },
      isActive: true
    },
    {
      id: 'chk_15',
      categoryId: 'cat_conversion',
      number: 15,
      title: 'Frictionless Path to Action',
      evaluatorQuestion: 'Is the path from visitor interest to action obvious and low-friction?',
      checklistQuestion: 'Can a motivated visitor get in touch or request a quote in under 30 seconds?',
      scoringGuidance: {
        0: 'Maze-like navigation; requires multiple clicks across disconnected pages to reach an action step.',
        1: 'Requires hunting through navigation submenus or waiting on slow third-party widgets.',
        2: 'Direct, seamless path allowing a visitor to initiate a quote or conversation in under 30 seconds.'
      },
      isActive: true
    },

    // Category 4: Trust & Credibility
    {
      id: 'chk_16',
      categoryId: 'cat_trust',
      number: 16,
      title: 'Visible Social Proof & Reviews',
      evaluatorQuestion: 'Are reviews, testimonials, or other social proof prominently visible?',
      checklistQuestion: 'Are authentic customer reviews or ratings visible right where decisions happen?',
      scoringGuidance: {
        0: 'Zero reviews, ratings, or client testimonials visible anywhere on the main journey.',
        1: 'Testimonials exist but are buried on a hidden page or look unverified ("- John D.").',
        2: 'Real customer quotes with full names, locations/project context, Google/Trustpilot badges shown.'
      },
      isActive: true
    },
    {
      id: 'chk_17',
      categoryId: 'cat_trust',
      number: 17,
      title: 'Authentic Visual Imagery',
      evaluatorQuestion: 'Is real business, project, or product imagery used where appropriate?',
      checklistQuestion: 'Do you use authentic photos of your team, work, or equipment rather than sterile stock?',
      scoringGuidance: {
        0: 'Exclusively generic stock photos of corporate models in suits completely unrelated to the trade.',
        1: 'A mix of real and obvious stock photos; key team/equipment/work proof is missing.',
        2: 'High-quality authentic photos of actual team members, trucks, completed jobs, or facility.'
      },
      isActive: true
    },
    {
      id: 'chk_18',
      categoryId: 'cat_trust',
      number: 18,
      title: 'Credentials & Trust Signals',
      evaluatorQuestion: 'Are credentials, experience, guarantees, affiliations, or trust signals displayed?',
      checklistQuestion: 'Are your licenses, insurance, industry affiliations, and guarantees clearly displayed?',
      scoringGuidance: {
        0: 'No mention of licensing, insurance, guarantees, or certifications where critical to trust.',
        1: 'Trust badges mentioned in text only, without recognized logos or specific policy details.',
        2: 'Licensed & Insured badges, BBB ratings, industry certifications, and clear satisfaction guarantees.'
      },
      isActive: true
    },
    {
      id: 'chk_19',
      categoryId: 'cat_trust',
      number: 19,
      title: 'Verifiable Contact Information',
      evaluatorQuestion: 'Does business contact information appear legitimate and easy to verify?',
      checklistQuestion: 'Is your phone number, physical address, and contact info clearly verifiable?',
      scoringGuidance: {
        0: 'Anonymous site; only an unformatted web form with no phone, address, or registered entity.',
        1: 'Phone number in text but not clickable (tap-to-call), or physical address is vague.',
        2: 'Clickable direct phone number in header, local physical address, and verified operating hours.'
      },
      isActive: true
    },
    {
      id: 'chk_20',
      categoryId: 'cat_trust',
      number: 20,
      title: 'Current & Maintained Appearance',
      evaluatorQuestion: 'Does the website feel current, maintained, and professionally credible?',
      checklistQuestion: 'Does your site look modern, maintained, and updated with current information?',
      scoringGuidance: {
        0: 'Severely outdated design (e.g. copyright 2014, broken layout, dead links, obsolete announcements).',
        1: 'Functional but visibly dated styling, misaligned elements, or stale blog last updated years ago.',
        2: 'Polished modern aesthetic, active copyright, flawless links, and active operational signals.'
      },
      isActive: true
    },

    // Category 5: Mobile & User Experience
    {
      id: 'chk_21',
      categoryId: 'cat_mobile_ux',
      number: 21,
      title: 'Mobile Layout Integrity',
      evaluatorQuestion: 'Does the site work cleanly on mobile without cutoffs, overlap, or awkward spacing?',
      checklistQuestion: 'Does the site display flawlessly on mobile screens without horizontal scroll or cutoffs?',
      scoringGuidance: {
        0: 'Broken on mobile: horizontal scrolling, text overflowing screen boundaries, unreadable viewport.',
        1: 'Responsive but has awkward gaps, squished images, or overlapping sticky banners.',
        2: 'Impeccable responsive design; fluid, natural vertical flow specifically tailored for mobile users.'
      },
      isActive: true
    },
    {
      id: 'chk_22',
      categoryId: 'cat_mobile_ux',
      number: 22,
      title: 'Simple Navigation Structure',
      evaluatorQuestion: 'Is navigation simple, intuitive, and understandable?',
      checklistQuestion: 'Is your navigation menu simple, clean, and focused on what buyers need?',
      scoringGuidance: {
        0: 'Overwhelming bloated menu (20+ links), deep 3-level dropdowns, or missing mobile hamburger.',
        1: 'Navigation is present but unordered, or uses ambiguous category labels.',
        2: 'Lean, focused menu (4–6 core links) highlighting the key service pages and primary action button.'
      },
      isActive: true
    },
    {
      id: 'chk_23',
      categoryId: 'cat_mobile_ux',
      number: 23,
      title: 'Typography & Readability',
      evaluatorQuestion: 'Is text readable without excessive density, tiny sizing, or poor contrast?',
      checklistQuestion: 'Is your typography easy to read with strong contrast and comfortable font sizes?',
      scoringGuidance: {
        0: 'Tiny 11px font, low-contrast gray text on gray backgrounds, or dense unbroken text blocks.',
        1: 'Readable on desktop but requires pinch-to-zoom on mobile or has suboptimal line-height.',
        2: 'Crisp, high-contrast typography (16px+ body), generous line spacing, and scannable subheadings.'
      },
      isActive: true
    },
    {
      id: 'chk_24',
      categoryId: 'cat_mobile_ux',
      number: 24,
      title: 'Touch-Friendly Interactive Elements',
      evaluatorQuestion: 'Are buttons and interactive elements easy to tap and use on mobile devices?',
      checklistQuestion: 'Are all buttons, inputs, and links easy to tap comfortably with a thumb?',
      scoringGuidance: {
        0: 'Tiny links clustered closely together resulting in frustrating mis-taps; microscopic form inputs.',
        1: 'Buttons are tappable but small (under 40px height) or positioned right against screen edges.',
        2: 'Generous touch targets (48px+ min), thumb-accessible sticky call buttons, and large input fields.'
      },
      isActive: true
    },
    {
      id: 'chk_25',
      categoryId: 'cat_mobile_ux',
      number: 25,
      title: 'Clutter-Free Information Flow',
      evaluatorQuestion: 'Is important information accessible without unnecessary scrolling or clutter?',
      checklistQuestion: 'Can visitors find essential answers without wading through paragraphs of fluff?',
      scoringGuidance: {
        0: 'Essential details buried under endless filler paragraphs, decorative dividers, and pop-up overlays.',
        1: 'Takes excessive scrolling to reach key specifications, pricing, or service areas.',
        2: 'Concise, high-signal information architecture with quick jump links or bulleted callouts.'
      },
      isActive: true
    },

    // Category 6: Discoverability & Local SEO
    {
      id: 'chk_26',
      categoryId: 'cat_seo',
      number: 26,
      title: 'Clear Page Titles & Headings',
      evaluatorQuestion: 'Do page titles and headings clearly describe the business and primary services?',
      checklistQuestion: 'Do your H1 headlines and page titles clearly name your specific service and market?',
      scoringGuidance: {
        0: 'Generic page titles ("Home", "Page 1") or missing H1 tags.',
        1: 'Headings exist but are purely decorative or clever rather than search-descriptive.',
        2: 'Accurate, descriptive H1/H2 headings combining service category and value keywords cleanly.'
      },
      isActive: true
    },
    {
      id: 'chk_27',
      categoryId: 'cat_seo',
      number: 27,
      title: 'Geographic Service-Area Language',
      evaluatorQuestion: 'Does geographic and service-area language appear where appropriate?',
      checklistQuestion: 'Are your local city, counties, and neighborhoods mentioned naturally in your copy?',
      scoringGuidance: {
        0: 'Zero geographic keywords; search engines and users cannot associate the site with any city.',
        1: 'City mentioned once in copyright footer, but absent in body copy, headlines, or service descriptions.',
        2: 'Natural, localized copy referencing primary service areas, neighboring counties, and landmarks.'
      },
      isActive: true
    },
    {
      id: 'chk_28',
      categoryId: 'cat_seo',
      number: 28,
      title: 'Crawlable Service Content',
      evaluatorQuestion: 'Do services have enough crawlable written content to be understood by search engines?',
      checklistQuestion: 'Do you have dedicated, written text for each major service rather than flat images?',
      scoringGuidance: {
        0: 'Thin site: all content is locked inside flattened graphics/images or has fewer than 50 words.',
        1: 'Brief 1-sentence mentions for multiple services without dedicated descriptions or structure.',
        2: 'Rich, helpful written explanations for each core service answering real customer search queries.'
      },
      isActive: true
    },
    {
      id: 'chk_29',
      categoryId: 'cat_seo',
      number: 29,
      title: 'Consistent NAP & Business Details',
      evaluatorQuestion: 'Is basic local-business trust information (Name, Address, Phone) consistent and accessible?',
      checklistQuestion: 'Is your business Name, Address, and Phone (NAP) cleanly formatted and consistent?',
      scoringGuidance: {
        0: 'Inconsistent or missing address/phone; conflicting business names on different pages.',
        1: 'Contact info is split or hard to copy/paste; lacks schema or standard local formatting.',
        2: 'Structured, consistent Name, Address, Phone, operating hours, and Google Maps integration.'
      },
      isActive: true
    },
    {
      id: 'chk_30',
      categoryId: 'cat_seo',
      number: 30,
      title: 'Structured Multi-Page Architecture',
      evaluatorQuestion: 'Does the site have an intentional page structure rather than relying on one vague generic page?',
      checklistQuestion: 'Does your site have dedicated pages for major services rather than one generic catch-all?',
      scoringGuidance: {
        0: 'One single vague page attempting to cover 10 unrelated services with zero dedicated URLs.',
        1: 'Multi-page in theory, but sub-pages are essentially empty duplicates of the homepage.',
        2: 'Well-structured hierarchy with dedicated, high-value landing pages for major service categories.'
      },
      isActive: true
    }
  ]
};

export const INITIAL_DIAGNOSES: Diagnosis[] = [
  {
    id: 'diag_generic_headline',
    name: 'Generic Hero Headline',
    category: 'First Impression & Clarity',
    triggers: [
      { checkId: 'chk_1', triggerScores: [0, 1] },
      { checkId: 'chk_2', triggerScores: [0, 1] }
    ],
    severity: 'Critical',
    finding: 'The hero section does not immediately communicate what the business does and why the visitor should care.',
    whyItMatters: 'Visitors decide within 3–5 seconds whether they are in the right place. A vague opening forces them to interpret the business before they can consider inquiring.',
    recommendedFix: 'Replace the company-centered tagline with a clear service + outcome + location-oriented headline.',
    exampleImprovement: 'Instead of "Welcome to Smith Enterprises", use "Same-Day Roll-Off Dumpster Rentals Across Dallas–Fort Worth".',
    suggestedPriority: 'fix_first',
    recommendedOffer: 'Homepage Conversion Blueprint',
    internalNotes: 'Top cause of high immediate bounce rates.',
    isActive: true
  },
  {
    id: 'diag_missing_location',
    name: 'Missing Service Area in Hero',
    category: 'First Impression & Clarity',
    triggers: [
      { checkId: 'chk_3', triggerScores: [0, 1] },
      { checkId: 'chk_27', triggerScores: [0, 1] }
    ],
    severity: 'High',
    finding: 'The website does not immediately state which geographic areas, cities, or counties are served.',
    whyItMatters: 'Local service buyers will immediately bounce if they suspect the contractor or provider does not service their specific neighborhood.',
    recommendedFix: 'Add a prominent geo-tag badge directly above the hero headline and in the top navigation bar.',
    exampleImprovement: 'Add: "Serving Dallas, Tarrant, Collin & Denton Counties with 24-Hour Dispatch".',
    suggestedPriority: 'fix_first',
    recommendedOffer: '48-Hour Homepage Rescue',
    internalNotes: 'Critical for regional & trade businesses.',
    isActive: true
  },
  {
    id: 'diag_competing_ctas',
    name: 'Competing & Diluted CTAs',
    category: 'Conversion & CTA',
    triggers: [
      { checkId: 'chk_5', triggerScores: [0, 1] },
      { checkId: 'chk_11', triggerScores: [0, 1] },
      { checkId: 'chk_12', triggerScores: [0, 1] }
    ],
    severity: 'Critical',
    finding: 'Multiple buttons with equal visual weight compete for the visitor’s attention (e.g. Call, Email, Learn More, Follow Us).',
    whyItMatters: 'When presented with too many equal choices, visitors experience analysis paralysis and take no action at all.',
    recommendedFix: 'Establish ONE high-contrast primary conversion action (e.g. "Request Instant Quote") and demote all other links to subtle secondary text styles.',
    exampleImprovement: 'Feature a bold primary button "Get Exact Pricing" paired with a secondary text link "Or Call (214) 555-0192".',
    suggestedPriority: 'fix_first',
    recommendedOffer: '48-Hour Homepage Rescue',
    internalNotes: 'Consolidates leak points immediately.',
    isActive: true
  },
  {
    id: 'diag_buried_cta',
    name: 'Buried Call to Action',
    category: 'Conversion & CTA',
    triggers: [
      { checkId: 'chk_13', triggerScores: [0, 1] },
      { checkId: 'chk_15', triggerScores: [0, 1] }
    ],
    severity: 'High',
    finding: 'The main call to action only appears once at the very top or bottom of the page, leaving large scrolling dead zones.',
    whyItMatters: 'Visitors who become convinced midway down the page must scroll back up or search around to figure out how to buy.',
    recommendedFix: 'Insert strategic mid-page CTA banners after key proof blocks and maintain a persistent header CTA button.',
    exampleImprovement: 'Add a mid-page "Ready to get started? Check your delivery date now" banner right after the pricing breakdown.',
    suggestedPriority: 'fix_next',
    recommendedOffer: 'Website Conversion Checkup',
    internalNotes: 'Common UX mistake on long-scrolling homepages.',
    isActive: true
  },
  {
    id: 'diag_vague_cta_wording',
    name: 'Low-Intent CTA Button Copy',
    category: 'Conversion & CTA',
    triggers: [
      { checkId: 'chk_12', triggerScores: [0, 1] }
    ],
    severity: 'Medium',
    finding: 'Buttons use generic, non-committal labels like "Submit", "Learn More", or "Click Here".',
    whyItMatters: 'Generic button text fails to communicate the value of clicking and increases hesitation regarding what will happen next.',
    recommendedFix: 'Change button copy to state the specific outcome the user will receive immediately upon clicking.',
    exampleImprovement: 'Replace "Submit" with "Get My Free Dumpster Quote in 60 Seconds".',
    suggestedPriority: 'fix_next',
    recommendedOffer: 'Homepage Conversion Blueprint',
    internalNotes: 'Simple 5-minute fix that boosts click-through.',
    isActive: true
  },
  {
    id: 'diag_excessive_form_friction',
    name: 'Overly Complex Inquiry Forms',
    category: 'Conversion & CTA',
    triggers: [
      { checkId: 'chk_14', triggerScores: [0, 1] },
      { checkId: 'chk_15', triggerScores: [0, 1] }
    ],
    severity: 'High',
    finding: 'Inquiry forms ask for 8+ required fields (e.g. full mailing address, fax, exact timeline, job budget) before initial contact.',
    whyItMatters: 'Every additional required field reduces form completion rates by 10–25%. Buyers abandon long forms on mobile.',
    recommendedFix: 'Reduce the initial form to 3 or 4 essential fields (Name, Phone/Email, Service Needed, Zip Code). Gather additional details during follow-up.',
    exampleImprovement: 'Shorten form to: 1. Dumpster Size 2. Delivery Zip 3. Phone Number 4. Preferred Date.',
    suggestedPriority: 'fix_first',
    recommendedOffer: '48-Hour Homepage Rescue',
    internalNotes: 'Massive conversion lever for local trade services.',
    isActive: true
  },
  {
    id: 'diag_missing_social_proof',
    name: 'Absent or Buried Customer Proof',
    category: 'Trust & Credibility',
    triggers: [
      { checkId: 'chk_16', triggerScores: [0, 1] }
    ],
    severity: 'High',
    finding: 'Customer reviews, ratings, and testimonials are missing from the primary conversion path or hidden on a sub-page.',
    whyItMatters: '88% of buyers read reviews before choosing a local service. Without visible proof, visitors assume risk and look for alternatives.',
    recommendedFix: 'Embed a high-visibility social proof strip directly beneath the hero headline, featuring real star ratings and customer quotes.',
    exampleImprovement: 'Add: "★ 4.9/5 Rating across 140+ DFW Homeowners & Contractors" with 3 featured verified customer blurbs.',
    suggestedPriority: 'fix_first',
    recommendedOffer: 'Homepage Conversion Blueprint',
    internalNotes: 'Directly impacts conversion rate and pricing power.',
    isActive: true
  },
  {
    id: 'diag_generic_stock_photos',
    name: 'Sterile Stock Imagery',
    category: 'Trust & Credibility',
    triggers: [
      { checkId: 'chk_17', triggerScores: [0, 1] },
      { checkId: 'chk_20', triggerScores: [0, 1] }
    ],
    severity: 'Medium',
    finding: 'The website relies heavily on generic corporate stock photos that look artificial and disconnect from real local operations.',
    whyItMatters: 'Stock photos trigger skepticism. Customers want to see the actual trucks, real crew, and authentic equipment that will arrive at their property.',
    recommendedFix: 'Replace stock photography with authentic high-resolution photos of actual staff, equipment, and real job sites.',
    exampleImprovement: 'Show actual DFW Roll-Off trucks delivering dumpsters on real Texas driveways.',
    suggestedPriority: 'fix_next',
    recommendedOffer: 'Starter Website Build',
    internalNotes: 'Creates strong authentic connection.',
    isActive: true
  },
  {
    id: 'diag_missing_trust_signals',
    name: 'Weak Credentials & Assurance Badges',
    category: 'Trust & Credibility',
    triggers: [
      { checkId: 'chk_18', triggerScores: [0, 1] },
      { checkId: 'chk_19', triggerScores: [0, 1] }
    ],
    severity: 'Medium',
    finding: 'Key credibility indicators such as "Licensed & Insured", satisfaction guarantees, and local affiliations are missing.',
    whyItMatters: 'First-time visitors need immediate reassurance that the company is reliable, insured against property damage, and legitimate.',
    recommendedFix: 'Add a trust icon bar featuring "100% Licensed & Insured", "On-Time Delivery Guarantee", and "Driveway Protection Promise".',
    exampleImprovement: 'Place 4 trust badges right below the quote form container.',
    suggestedPriority: 'fix_next',
    recommendedOffer: 'Homepage Conversion Blueprint',
    internalNotes: 'Removes purchasing hesitation.',
    isActive: true
  },
  {
    id: 'diag_broken_mobile_layout',
    name: 'Mobile Usability & Spacing Issues',
    category: 'Mobile & User Experience',
    triggers: [
      { checkId: 'chk_21', triggerScores: [0, 1] },
      { checkId: 'chk_24', triggerScores: [0, 1] }
    ],
    severity: 'Critical',
    finding: 'Mobile layout suffers from cutoffs, overlapping banners, or tiny un-clickable phone numbers.',
    whyItMatters: 'Over 65% of local service searches occur on mobile devices. A broken mobile experience guarantees lost revenue.',
    recommendedFix: 'Implement a mobile-first responsive container structure with a persistent "Tap to Call / Quote" bottom bar.',
    exampleImprovement: 'Add a fixed bottom action bar on mobile with two direct buttons: "Call Now" & "Get Quote".',
    suggestedPriority: 'fix_first',
    recommendedOffer: '48-Hour Homepage Rescue',
    internalNotes: 'Immediate win for mobile traffic.',
    isActive: true
  },
  {
    id: 'diag_unclear_pricing_process',
    name: 'Unclear Pricing & "What Happens Next"',
    category: 'Offer & Messaging',
    triggers: [
      { checkId: 'chk_9', triggerScores: [0, 1] },
      { checkId: 'chk_10', triggerScores: [0, 1] }
    ],
    severity: 'Medium',
    finding: 'Visitors have no idea how much services roughly cost or what the 3-step rental/booking process involves.',
    whyItMatters: 'Fear of hidden fees or an overly complicated process causes prospects to hesitate and look for transparent competitors.',
    recommendedFix: 'Introduce a clear 3-Step "How It Works" diagram (1. Choose Size, 2. We Deliver, 3. We Haul Away) and transparent base rates.',
    exampleImprovement: 'Show container sizes (10yd, 15yd, 20yd) with base starting rates and rental duration terms.',
    suggestedPriority: 'fix_next',
    recommendedOffer: 'Homepage Conversion Blueprint',
    internalNotes: 'Demystifies service and reduces quote drop-offs.',
    isActive: true
  },
  {
    id: 'diag_thin_local_seo',
    name: 'Thin Local SEO & Service Architecture',
    category: 'Discoverability & Local SEO',
    triggers: [
      { checkId: 'chk_26', triggerScores: [0, 1] },
      { checkId: 'chk_28', triggerScores: [0, 1] },
      { checkId: 'chk_30', triggerScores: [0, 1] }
    ],
    severity: 'Medium',
    finding: 'The site relies on a single generic page without dedicated landing structures or crawlable keyword content for major services.',
    whyItMatters: 'Google and local searchers struggle to rank or find the site for high-intent terms like "commercial roll-off Dallas" or "residential dumpster Fort Worth".',
    recommendedFix: 'Create dedicated sub-pages or distinct homepage modules for residential vs. commercial clients and top suburban service zones.',
    exampleImprovement: 'Add structured sections for "Residential Remodel Dumpsters" and "Commercial Construction Roll-Offs".',
    suggestedPriority: 'later',
    recommendedOffer: 'Starter Website Build',
    internalNotes: 'Long-term organic traffic multiplier.',
    isActive: true
  }
];

// Helper to create realistic SVG mockup Blobs for the demo audit
export function createSvgBlob(svgString: string): Blob {
  return new Blob([svgString], { type: 'image/svg+xml' });
}

export function generateDemoSourceOfTruthSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f1f5f9"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>
    </defs>
    <!-- Browser Chrome -->
    <rect width="1200" height="800" fill="#ffffff"/>
    <rect width="1200" height="42" fill="#0f172a"/>
    <circle cx="24" cy="21" r="6" fill="#ef4444"/>
    <circle cx="44" cy="21" r="6" fill="#f59e0b"/>
    <circle cx="64" cy="21" r="6" fill="#10b981"/>
    <rect x="100" y="10" width="600" height="22" rx="4" fill="#1e293b"/>
    <text x="115" y="25" fill="#94a3b8" font-family="sans-serif" font-size="12">https://www.dfwrolloffsolutions-example.com</text>
    
    <!-- Website Navigation Header -->
    <rect y="42" width="1200" height="70" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="60" y="85" fill="#1e293b" font-family="sans-serif" font-size="22" font-weight="bold">DFW Roll-Off Solutions</text>
    <text x="500" y="82" fill="#64748b" font-family="sans-serif" font-size="14">Home   About   Services   Gallery   Contact Us   FAQ</text>
    <rect x="980" y="58" width="160" height="38" rx="4" fill="#64748b"/>
    <text x="1020" y="82" fill="#ffffff" font-family="sans-serif" font-size="13">Contact Us</text>
    
    <!-- Weak Hero Section -->
    <rect y="112" width="1200" height="420" fill="url(#bgGrad)"/>
    <rect x="60" y="160" width="520" height="320" fill="#ffffff" rx="8" opacity="0.9" stroke="#cbd5e1"/>
    <text x="90" y="210" fill="#64748b" font-family="sans-serif" font-size="14" font-weight="600">WELCOME TO OUR OFFICIAL SITE</text>
    <text x="90" y="250" fill="#0f172a" font-family="sans-serif" font-size="28" font-weight="bold">Quality Dumpster Service You Can Trust</text>
    <text x="90" y="290" fill="#475569" font-family="sans-serif" font-size="14">We have been providing waste containment and roll-off containers to residential and commercial clients for over 12 years with integrity and reliable equipment.</text>
    
    <!-- Confusing & Competing CTAs -->
    <rect x="90" y="340" width="140" height="42" rx="4" fill="#3b82f6"/>
    <text x="120" y="366" fill="#ffffff" font-family="sans-serif" font-size="14">Learn More</text>
    
    <rect x="245" y="340" width="140" height="42" rx="4" fill="#64748b"/>
    <text x="275" y="366" fill="#ffffff" font-family="sans-serif" font-size="14">Email Us</text>
    
    <rect x="400" y="340" width="140" height="42" rx="4" fill="#0f172a"/>
    <text x="430" y="366" fill="#ffffff" font-family="sans-serif" font-size="14">Call Today</text>

    <!-- Stock Image Placeholder in Hero -->
    <rect x="640" y="160" width="500" height="320" rx="8" fill="#cbd5e1"/>
    <text x="760" y="320" fill="#64748b" font-family="sans-serif" font-size="16">[Generic Unrelated Construction Stock Photo]</text>
    
    <!-- Services Section -->
    <rect y="532" width="1200" height="268" fill="#ffffff"/>
    <text x="60" y="580" fill="#0f172a" font-family="sans-serif" font-size="22" font-weight="bold">Our Offerings</text>
    <rect x="60" y="600" width="340" height="150" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="80" y="640" fill="#1e293b" font-family="sans-serif" font-size="16" font-weight="bold">Roll-Off Containers</text>
    <text x="80" y="670" fill="#64748b" font-family="sans-serif" font-size="13">Various sizes available for all jobs.</text>
    
    <rect x="430" y="600" width="340" height="150" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="450" y="640" fill="#1e293b" font-family="sans-serif" font-size="16" font-weight="bold">Commercial Waste</text>
    <text x="450" y="670" fill="#64748b" font-family="sans-serif" font-size="13">Call for custom contract rates.</text>
    
    <rect x="800" y="600" width="340" height="150" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="820" y="640" fill="#1e293b" font-family="sans-serif" font-size="16" font-weight="bold">Recycling Hauling</text>
    <text x="820" y="670" fill="#64748b" font-family="sans-serif" font-size="13">Specialty cleanout hauling service.</text>
  </svg>`;
}

export function generateDemoFixedDirectionSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
    <defs>
      <linearGradient id="heroFixedGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e1b4b"/>
      </linearGradient>
    </defs>
    <!-- Browser Chrome -->
    <rect width="1200" height="800" fill="#ffffff"/>
    <rect width="1200" height="42" fill="#0f172a"/>
    <circle cx="24" cy="21" r="6" fill="#ef4444"/>
    <circle cx="44" cy="21" r="6" fill="#f59e0b"/>
    <circle cx="64" cy="21" r="6" fill="#10b981"/>
    <rect x="100" y="10" width="600" height="22" rx="4" fill="#1e293b"/>
    <text x="115" y="25" fill="#38bdf8" font-family="sans-serif" font-size="12">https://www.dfwrolloffsolutions.com (Recommended Fixed Direction)</text>

    <!-- Top Announcement Bar -->
    <rect y="42" width="1200" height="32" fill="#4f46e5"/>
    <text x="600" y="63" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">⚡ SAME-DAY & NEXT-DAY DUMPSTER DISPATCH ACROSS DALLAS–FORT WORTH & SURROUNDING COUNTIES</text>

    <!-- Clean Header Navigation -->
    <rect y="74" width="1200" height="70" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <text x="60" y="116" fill="#0f172a" font-family="sans-serif" font-size="22" font-weight="800">DFW Roll-Off <tspan fill="#4f46e5">Solutions</tspan></text>
    <text x="440" y="114" fill="#475569" font-family="sans-serif" font-size="14" font-weight="500">Dumpster Sizes   •   Pricing Guide   •   How It Works   •   Reviews</text>
    
    <rect x="880" y="88" width="260" height="42" rx="6" fill="#4f46e5"/>
    <text x="1010" y="114" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold">Call Now: (214) 555-0192</text>

    <!-- High-Converting Hero Section -->
    <rect y="144" width="1200" height="440" fill="url(#heroFixedGrad)"/>
    
    <!-- Hero Left: Copy & Value Proposition -->
    <rect x="60" y="175" width="230" height="26" rx="13" fill="#312e81" stroke="#6366f1" stroke-width="1"/>
    <text x="175" y="192" text-anchor="middle" fill="#c7d2fe" font-family="sans-serif" font-size="11" font-weight="700">★ 4.9/5 RATING • 140+ DFW REVIEWS</text>
    
    <text x="60" y="245" fill="#ffffff" font-family="sans-serif" font-size="34" font-weight="800">Fast, Hassle-Free Roll-Off</text>
    <text x="60" y="285" fill="#38bdf8" font-family="sans-serif" font-size="34" font-weight="800">Dumpster Rentals in DFW</text>
    
    <text x="60" y="325" fill="#cbd5e1" font-family="sans-serif" font-size="15">Delivered on time to your home or jobsite. Driveway-safe protection, transparent flat-rate pricing, and prompt haul-away.</text>
    
    <!-- Quick Trust Badges -->
    <text x="60" y="375" fill="#94a3b8" font-family="sans-serif" font-size="13">✓ Same-Day Dispatch   ✓ 10, 15, 20 & 30-Yard Sizes   ✓ 100% Licensed & Insured</text>

    <!-- Hero Right: Streamlined 3-Field Instant Quote Form -->
    <rect x="720" y="175" width="420" height="375" rx="12" fill="#ffffff" filter="drop-shadow(0 10px 25px rgba(0,0,0,0.3))"/>
    <text x="750" y="215" fill="#0f172a" font-family="sans-serif" font-size="20" font-weight="bold">Check Dumpster Availability</text>
    <text x="750" y="238" fill="#64748b" font-family="sans-serif" font-size="13">Get an exact flat-rate quote in under 60 seconds.</text>
    
    <!-- Input 1 -->
    <rect x="750" y="260" width="360" height="42" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="765" y="286" fill="#94a3b8" font-family="sans-serif" font-size="13">Select Size (10, 15, 20, 30 Yard)...</text>
    
    <!-- Input 2 -->
    <rect x="750" y="315" width="360" height="42" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="765" y="341" fill="#94a3b8" font-family="sans-serif" font-size="13">Delivery Zip Code (e.g. 75001)...</text>
    
    <!-- Input 3 -->
    <rect x="750" y="370" width="360" height="42" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="765" y="396" fill="#94a3b8" font-family="sans-serif" font-size="13">Phone Number for Instant Rate...</text>

    <!-- Prominent Action Button -->
    <rect x="750" y="430" width="360" height="50" rx="6" fill="#10b981"/>
    <text x="930" y="462" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold">Get Instant Flat-Rate Quote →</text>
    
    <text x="930" y="505" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">🔒 No spam. Driveway protection guarantee included.</text>

    <!-- Social Proof Bar Below Hero -->
    <rect y="584" width="1200" height="120" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <text x="120" y="630" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="bold">"Dropped it off in 3 hours. Best price in Plano."</text>
    <text x="120" y="650" fill="#64748b" font-family="sans-serif" font-size="12">— Marcus R., Home Remodeler</text>
    
    <text x="500" y="630" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="bold">"Driveway safe boards placed down. Flawless service."</text>
    <text x="500" y="650" fill="#64748b" font-family="sans-serif" font-size="12">— Sarah T., Dallas Homeowner</text>
    
    <text x="880" y="630" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="bold">"Transparent pricing with no surprise landfill fees."</text>
    <text x="880" y="650" fill="#64748b" font-family="sans-serif" font-size="12">— Dave K., Commercial GC</text>
  </svg>`;
}

export function buildDemoAudit(framework: MasterFramework): { audit: Audit; assets: AuditAsset[] } {
  const auditId = 'audit_demo_dfw_rolloff';
  const now = new Date().toISOString();

  const sourceAssetId = 'asset_demo_source_hero';
  const fixedAssetId = 'asset_demo_fixed_hero';

  const sourceAsset: AuditAsset = {
    id: sourceAssetId,
    auditId,
    type: 'source_of_truth',
    subType: 'desktop_hero',
    title: 'Current Homepage Hero & Header',
    caption: 'Current desktop hero above the fold',
    notes: 'The current hero lacks a clear geographic tag, uses a weak motto ("Quality Dumpster Service You Can Trust"), and presents three competing action buttons with equal weight.',
    blob: createSvgBlob(generateDemoSourceOfTruthSvg()),
    mimeType: 'image/svg+xml',
    filename: 'dfw_rolloff_current_hero.svg',
    width: 1200,
    height: 800,
    createdAt: now,
    pins: [
      {
        id: 'pin_s1',
        number: 1,
        x: 18,
        y: 28,
        title: 'Vague Motto Headline',
        description: 'Does not state primary service, turnaround speed, or local service boundaries.'
      },
      {
        id: 'pin_s2',
        number: 2,
        x: 28,
        y: 45,
        title: 'Competing & Diluted Action Buttons',
        description: 'Three equal buttons ("Learn More", "Email Us", "Call Today") cause decision friction.'
      },
      {
        id: 'pin_s3',
        number: 3,
        x: 75,
        y: 35,
        title: 'Generic Stock Photo',
        description: 'Stock image misses the opportunity to display real roll-off containers and driveway protection.'
      },
      {
        id: 'pin_s4',
        number: 4,
        x: 88,
        y: 10,
        title: 'Weak Header CTA',
        description: 'Header button is passive ("Contact Us") rather than a high-intent quote or phone conversion.'
      }
    ]
  };

  const fixedAsset: AuditAsset = {
    id: fixedAssetId,
    auditId,
    type: 'fixed_direction',
    subType: 'desktop_hero',
    title: 'Proposed High-Converting Homepage Hero',
    caption: 'Restructured hero with instant quote calculator',
    notes: 'Demonstrates immediate 5-second clarity, DFW service area confirmation, bold social proof strip, and a 3-field instant quote calculator.',
    blob: createSvgBlob(generateDemoFixedDirectionSvg()),
    mimeType: 'image/svg+xml',
    filename: 'dfw_rolloff_recommended_direction.svg',
    width: 1200,
    height: 800,
    createdAt: now,
    pins: [
      {
        id: 'pin_f1',
        number: 1,
        x: 22,
        y: 32,
        title: 'Outcome & Service Headline',
        description: 'Clearly announces "Fast, Hassle-Free Roll-Off Dumpster Rentals in DFW" with turnaround speed.'
      },
      {
        id: 'pin_f2',
        number: 2,
        x: 78,
        y: 48,
        title: 'Streamlined 3-Field Quote Box',
        description: 'Allows immediate pricing calculation (Size + Zip + Phone) without phone tag.'
      },
      {
        id: 'pin_f3',
        number: 3,
        x: 50,
        y: 78,
        title: 'Prominent Social Proof Strip',
        description: 'Shows 3 verified local homeowner and contractor reviews directly below the hero.'
      },
      {
        id: 'pin_f4',
        number: 4,
        x: 85,
        y: 14,
        title: 'Direct Click-to-Call Header',
        description: 'Prominent phone number with direct tap-to-call for immediate dispatch inquiries.'
      }
    ]
  };

  // Demo Scores: 42 / 60 (Medium Rescue)
  // Category 1: 7/10 (chk1=1, chk2=1, chk3=1, chk4=2, chk5=2) -> 7
  // Category 2: 6/10 (chk6=2, chk7=1, chk8=1, chk9=1, chk10=1) -> 6
  // Category 3: 5/10 (chk11=1, chk12=1, chk13=1, chk14=1, chk15=1) -> 5
  // Category 4: 8/10 (chk16=1, chk17=1, chk18=2, chk19=2, chk20=2) -> 8
  // Category 5: 8/10 (chk21=1, chk22=2, chk23=2, chk24=1, chk25=2) -> 8
  // Category 6: 8/10 (chk26=1, chk27=1, chk28=2, chk29=2, chk30=2) -> 8
  // Total: 7 + 6 + 5 + 8 + 8 + 8 = 42 / 60

  const scores: Record<string, AuditScoreItem> = {
    chk_1: { score: 1, confidence: 'high', validationStatus: 'validated', rationale: 'Takes 8–10 seconds to decipher due to vague "Quality Service" slogan.', evidence: 'Vague slogan in hero container.', tags: ['Vague', 'Ambiguous', 'Requires interpretation'], evidenceAssetId: sourceAssetId, triggeredDiagnosisIds: ['diag_generic_headline'], suggestedFinding: 'Core offer requires close reading to understand what company sells.', suggestedPriority: 'fix_first' },
    chk_2: { score: 1, confidence: 'high', validationStatus: 'validated', rationale: 'Headline is company-centric rather than outcome-oriented.', evidence: '"Quality Dumpster Service You Can Trust" headline observed.', tags: ['Generic', 'Vague'], evidenceAssetId: sourceAssetId, triggeredDiagnosisIds: ['diag_generic_headline'], suggestedFinding: 'Headline communicates internal company motto rather than tangible client outcome.', suggestedPriority: 'fix_first' },
    chk_3: { score: 1, confidence: 'high', validationStatus: 'validated', rationale: 'DFW service area is only mentioned in the logo, not in hero copy.', evidence: 'No regional confirmation above the fold.', tags: ['Missing', 'No location context'], evidenceAssetId: sourceAssetId, triggeredDiagnosisIds: ['diag_missing_location'], suggestedFinding: 'Service territory is not confirmed above the fold.', suggestedPriority: 'fix_first' },
    chk_4: { score: 2, confidence: 'high', validationStatus: 'validated', rationale: 'Visual container structure is clean enough.', evidence: 'Clear separation between header, hero, and services.', tags: [], triggeredDiagnosisIds: [] },
    chk_5: { score: 2, confidence: 'high', validationStatus: 'validated', rationale: 'Buttons exist above fold, though competing in nature.', evidence: 'Action buttons present in viewport.', tags: [], triggeredDiagnosisIds: [] },

    chk_6: { score: 2, confidence: 'high', validationStatus: 'validated', rationale: 'Basic container sizes are mentioned below fold.', evidence: '10, 15, 20, and 30-yard options structured.', tags: [], triggeredDiagnosisIds: [] },
    chk_7: { score: 1, confidence: 'medium', validationStatus: 'validated', rationale: 'Claims quality but does not highlight same-day dispatch or driveway safety.', evidence: 'Generic claims in secondary text.', tags: ['Generic', 'Unsupported'], triggeredDiagnosisIds: [], suggestedPriority: 'fix_next' },
    chk_8: { score: 1, confidence: 'medium', validationStatus: 'validated', rationale: 'Focuses heavily on 12-year company history rather than customer job requirements.', evidence: 'Paragraph starts with "We have been providing... for 12 years".', tags: ['Generic', 'Requires interpretation'], triggeredDiagnosisIds: [], suggestedPriority: 'fix_next' },
    chk_9: { score: 1, confidence: 'medium', validationStatus: 'validated', rationale: 'No FAQ regarding driveway damage, permit requirements, or prohibited materials.', evidence: 'Zero objection handling on homepage.', tags: ['Missing', 'Friction'], triggeredDiagnosisIds: ['diag_unclear_pricing_process'], suggestedPriority: 'fix_next' },
    chk_10: { score: 1, confidence: 'high', validationStatus: 'validated', rationale: 'Zero transparent pricing ranges; forces a phone call for all quotes.', evidence: 'Calls required for basic ballpark estimates.', tags: ['Missing', 'Friction', 'Unclear next step'], triggeredDiagnosisIds: ['diag_unclear_pricing_process'], suggestedFinding: 'Pricing opacity causes quote hesitation.', suggestedPriority: 'fix_next' },

    chk_11: { score: 1, confidence: 'high', validationStatus: 'validated', rationale: 'Three equal buttons compete in the hero without clear primary hierarchy.', evidence: 'Learn More, Email Us, Call Today buttons have identical styling.', tags: ['Competing', 'Too many choices', 'Poor hierarchy'], evidenceAssetId: sourceAssetId, triggeredDiagnosisIds: ['diag_competing_ctas'], suggestedFinding: 'Multiple equal-weight buttons divide focus.', suggestedPriority: 'fix_first' },
    chk_12: { score: 1, confidence: 'high', validationStatus: 'validated', rationale: '"Learn More" and "Contact Us" are passive, low-intent labels.', evidence: 'Generic CTA labels.', tags: ['Vague', 'Unclear next step'], triggeredDiagnosisIds: ['diag_vague_cta_wording'], suggestedPriority: 'fix_next' },
    chk_13: { score: 1, confidence: 'medium', validationStatus: 'validated', rationale: 'No mid-page or bottom quote prompts; long scrolling dead zones.', evidence: 'Dead scroll zones below services section.', tags: ['Buried', 'Friction'], triggeredDiagnosisIds: ['diag_buried_cta'], suggestedPriority: 'fix_next' },
    chk_14: { score: 1, confidence: 'high', validationStatus: 'validated', rationale: 'Contact form asks for 7 fields before providing any pricing context.', evidence: 'Full address, fax, and timeline required upfront.', tags: ['Form friction', 'Friction', 'High commitment too early'], triggeredDiagnosisIds: ['diag_excessive_form_friction'], suggestedFinding: 'Excessive form fields create a barrier.', suggestedPriority: 'fix_first' },
    chk_15: { score: 1, confidence: 'medium', validationStatus: 'validated', rationale: 'Friction in requesting a quote due to lack of an instant rate calculator.', evidence: 'Multi-step manual inquiry path.', tags: ['Friction'], triggeredDiagnosisIds: ['diag_excessive_form_friction'], suggestedPriority: 'fix_next' },

    chk_16: { score: 1, confidence: 'high', validationStatus: 'validated', rationale: 'Reviews are buried on a hidden sub-page and not visible in hero.', evidence: 'Zero customer reviews above the fold.', tags: ['Missing social proof', 'Below the fold', 'No proof'], triggeredDiagnosisIds: ['diag_missing_social_proof'], suggestedFinding: 'Strong customer reviews are hidden away.', suggestedPriority: 'fix_first' },
    chk_17: { score: 1, confidence: 'high', validationStatus: 'validated', rationale: 'Hero uses generic stock photo instead of real trucks/equipment.', evidence: 'Generic corporate construction stock photo.', tags: ['Stock/generic proof', 'Weak credibility'], evidenceAssetId: sourceAssetId, triggeredDiagnosisIds: ['diag_generic_stock_photos'], suggestedFinding: 'Sterile stock photos weaken authenticity.', suggestedPriority: 'fix_next' },
    chk_18: { score: 2, confidence: 'high', validationStatus: 'validated', rationale: 'Mentions licensed and insured in footer.', evidence: '"100% Licensed & Insured" in footer text.', tags: [], triggeredDiagnosisIds: [] },
    chk_19: { score: 2, confidence: 'high', validationStatus: 'validated', rationale: 'Physical local address in Dallas is listed.', evidence: 'Dallas physical street address displayed.', tags: [], triggeredDiagnosisIds: [] },
    chk_20: { score: 2, confidence: 'high', validationStatus: 'validated', rationale: 'Site is maintained with active copyright.', evidence: 'Active current year copyright.', tags: [], triggeredDiagnosisIds: [] },

    chk_21: { score: 1, confidence: 'high', validationStatus: 'validated', rationale: 'Hero quote buttons stack awkwardly on narrow mobile screens.', evidence: 'Awkward 3-button stack on mobile viewports.', tags: ['Mobile issue', 'Readability'], triggeredDiagnosisIds: ['diag_broken_mobile_layout'], suggestedFinding: 'Mobile layout spacing breaks.', suggestedPriority: 'fix_first' },
    chk_22: { score: 2, confidence: 'high', validationStatus: 'validated', rationale: 'Navigation menu is clean with 5 links.', evidence: '5-item top navigation bar.', tags: [], triggeredDiagnosisIds: [] },
    chk_23: { score: 2, confidence: 'high', validationStatus: 'validated', rationale: 'Font sizing is readable.', evidence: '16px dark text over light background.', tags: [], triggeredDiagnosisIds: [] },
    chk_24: { score: 1, confidence: 'high', validationStatus: 'validated', rationale: 'Phone number in header is not a direct tap-to-call link on mobile.', evidence: 'Plain text un-clickable phone number.', tags: ['Mobile issue', 'Interaction issue', 'Friction'], triggeredDiagnosisIds: ['diag_broken_mobile_layout'], suggestedPriority: 'fix_next' },
    chk_25: { score: 2, confidence: 'high', validationStatus: 'validated', rationale: 'No excessive popup overlays.', evidence: 'Clean page load without popup modals.', tags: [], triggeredDiagnosisIds: [] },

    chk_26: { score: 1, confidence: 'medium', validationStatus: 'validated', rationale: 'H1 tag is currently "Welcome to Our Website" rather than keyword focused.', evidence: 'Vague H1 header.', tags: ['Generic', 'Poor hierarchy'], triggeredDiagnosisIds: ['diag_thin_local_seo'], suggestedPriority: 'later' },
    chk_27: { score: 1, confidence: 'medium', validationStatus: 'validated', rationale: 'Missing specific suburban target city mentions (Plano, Frisco, Arlington).', evidence: 'Surrounding counties missing from body copy.', tags: ['No location context', 'Incomplete'], triggeredDiagnosisIds: ['diag_missing_location'], suggestedPriority: 'later' },
    chk_28: { score: 2, confidence: 'high', validationStatus: 'validated', rationale: 'Container sizes have decent written descriptions.', evidence: 'Descriptive text for each container size.', tags: [], triggeredDiagnosisIds: [] },
    chk_29: { score: 2, confidence: 'high', validationStatus: 'validated', rationale: 'NAP information is consistent in footer.', evidence: 'Consistent Name, Address, Phone format.', tags: [], triggeredDiagnosisIds: [] },
    chk_30: { score: 2, confidence: 'high', validationStatus: 'validated', rationale: 'Dedicated services and contact pages exist.', evidence: 'Dedicated sub-page URLs.', tags: [], triggeredDiagnosisIds: [] }
  };

  const audit: Audit = {
    id: auditId,
    isDemo: true,
    businessName: 'DFW Roll-Off Solutions',
    websiteUrl: 'https://www.dfwrolloffsolutions-example.com',
    industry: 'Waste Management & Dumpster Rentals',
    cityServiceArea: 'Dallas–Fort Worth Metroplex, TX',
    primaryCustomerType: 'Homeowners, Remodelers & General Contractors',
    desiredAction: 'Request quote',
    auditorNotes: 'Strong local reputation and reliable fleet, but the website is leaking 40%+ of mobile visitors due to vague headlines, competing buttons, and hidden pricing.',
    status: 'Ready',
    frameworkVersion: framework.version,
    frameworkSnapshot: framework,
    scores,
    findings: [
      {
        id: 'finding_1',
        diagnosisId: 'diag_generic_headline',
        checkId: 'chk_2',
        associatedCheckIds: ['chk_1', 'chk_2', 'chk_3'],
        tags: ['Vague', 'Generic', 'Requires interpretation', 'No location context'],
        isConsolidated: true,
        tier: 'fix_first',
        order: 1,
        finding: 'The core offer and service area require too much interpretation above the fold.',
        whyItMatters: 'Visitors decide in 3–5 seconds whether they are in the right place. A company-centered headline without immediate service area confirmation forces visitors to scan around, leading to high bounce rates.',
        recommendedFix: 'Upgrade to a high-converting headline stating the exact service, speed, and location: "Fast, Hassle-Free Roll-Off Dumpster Rentals in DFW" with same-day dispatch badges.',
        exampleImprovement: 'Feature "Same-Day Delivery Available" with a 4.9/5 star badge directly above the headline.',
        customClientNotes: 'Consolidated from Checks #1, #2, and #3.',
        pinnedAssetId: sourceAssetId
      },
      {
        id: 'finding_2',
        diagnosisId: 'diag_competing_ctas',
        checkId: 'chk_11',
        associatedCheckIds: ['chk_11', 'chk_12', 'chk_14'],
        tags: ['Competing', 'Too many choices', 'Form friction'],
        isConsolidated: true,
        tier: 'fix_first',
        order: 2,
        finding: 'Competing action buttons and form friction divide focus and stall inquiries.',
        whyItMatters: 'When presented with 3+ equal choices ("Learn More", "Email Us", "Call Today") and long inquiry forms, visitors experience analysis paralysis and abandon the site.',
        recommendedFix: 'Establish ONE high-contrast primary conversion action: a 3-field "Check Dumpster Availability" instant quote box.',
        exampleImprovement: 'Combine instant quote submission with a secondary click-to-call header for emergency dispatch.',
        customClientNotes: 'Consolidated from Checks #11, #12, and #14.',
        pinnedAssetId: sourceAssetId
      },
      {
        id: 'finding_3',
        diagnosisId: 'diag_missing_social_proof',
        checkId: 'chk_16',
        associatedCheckIds: ['chk_16', 'chk_17'],
        tags: ['Missing social proof', 'Stock/generic proof', 'Below the fold'],
        isConsolidated: true,
        tier: 'fix_first',
        order: 3,
        finding: 'Strong local reviews and contractor testimonials are completely missing above the fold.',
        whyItMatters: 'First-time homeowners worry about property damage and unexpected landfill overage charges. Prominent reviews instantly eliminate doubt.',
        recommendedFix: 'Add a high-visibility social proof strip right below the hero with verified quotes emphasizing driveway protection and on-time drop-off.',
        exampleImprovement: 'Show: "★ 4.9/5 Rating across 140+ DFW Customers" + 3 verified homeowner blurbs.',
        customClientNotes: 'Consolidated from Checks #16 and #17.',
        pinnedAssetId: fixedAssetId
      },
      {
        id: 'finding_4',
        diagnosisId: 'diag_broken_mobile_layout',
        checkId: 'chk_21',
        associatedCheckIds: ['chk_21', 'chk_24'],
        tags: ['Mobile issue', 'Interaction issue', 'Friction'],
        isConsolidated: true,
        tier: 'fix_next',
        order: 4,
        finding: 'The header phone number is plain text and cannot be tapped directly on mobile devices.',
        whyItMatters: 'Over 65% of local dumpster inquiries come from mobile devices where contractors and homeowners need one-tap dialing.',
        recommendedFix: 'Convert the header contact to a prominent click-to-call button with active tel: links.',
        exampleImprovement: 'Fixed bottom bar on mobile: "📞 Call (214) 555-0192" + "⚡ Get Quote".',
        customClientNotes: 'Consolidated from Checks #21 and #24.',
        pinnedAssetId: fixedAssetId
      },
      {
        id: 'finding_5',
        diagnosisId: 'diag_unclear_pricing_process',
        checkId: 'chk_10',
        associatedCheckIds: ['chk_9', 'chk_10'],
        tags: ['Missing', 'Friction', 'Unclear next step'],
        isConsolidated: true,
        tier: 'fix_next',
        order: 5,
        finding: 'Missing transparent starting price ranges and "What to Expect" 3-step rental timeline.',
        whyItMatters: 'Uncertainty about pricing or hidden drop-off fees causes prospects to bounce and check competitors.',
        recommendedFix: 'Display clear container starting ranges (10yd, 15yd, 20yd, 30yd) alongside a 3-step "How It Works" diagram.',
        exampleImprovement: '1. Select Size → 2. We Deliver (Driveway Protected) → 3. Call Us for Haul Away.',
        customClientNotes: 'Consolidated from Checks #9 and #10.',
        pinnedAssetId: fixedAssetId
      }
    ],
    conversionPath: {
      currentSteps: [
        'Visitor lands from Google search',
        'Reads vague slogan "Quality Dumpster Service"',
        'Sees 3 competing buttons & no clear prices',
        'Looks for reviews or local coverage confirmation',
        'Bounces to call another local dumpster company'
      ],
      recommendedSteps: [
        'Visitor lands and immediately sees DFW service area & 4.9★ rating',
        'Understands same-day availability for 10–30 yard roll-offs',
        'Selects dumpster size & enters zip code in 3-field quote calculator',
        'Receives instant flat-rate quote and confirms delivery date',
        'Becomes booked customer with automated confirmation'
      ],
      notes: 'Transitioning from passive exploratory browsing to a direct, low-friction inquiry flow.'
    },
    reportConfig: {
      executiveSummary: 'DFW Roll-Off Solutions possesses strong local operations and great equipment, but the current website underperforms by hiding essential conversion drivers. By clarifying the hero outcome, streamlining the inquiry form from 7 fields to 3, showcasing verified homeowner reviews above the fold, and adding click-to-call mobile capabilities, DFW Roll-Off can capture an estimated 30–50% more qualified dumpster inquiries from existing web traffic.',
      selectedFindingIds: ['finding_1', 'finding_2', 'finding_3', 'finding_4', 'finding_5'],
      selectedSourceAssetIds: [sourceAssetId],
      selectedFixedDirectionAssetIds: [fixedAssetId],
      selectedPinIds: ['pin_s1', 'pin_s2', 'pin_s3', 'pin_s4', 'pin_f1', 'pin_f2', 'pin_f3', 'pin_f4'],
      showConversionBlueprint: true,
      showFixNext: true,
      showCategoryBreakdown: true,
      recommendedOffer: {
        offerName: '48-Hour Homepage Rescue',
        price: '$350',
        turnaround: '48 Hours',
        description: 'Complete done-for-you implementation of the high-converting hero, 3-field quote calculator, mobile click-to-call optimization, and verified review integration.',
        customScope: 'Includes custom DFW headline rewrite, 3-field quote integration, responsive mobile tap-to-call header, and social proof trust bar.',
        ctaText: 'Schedule Your 48-Hour Rescue'
      }
    },
    createdAt: now,
    updatedAt: now
  };

  return { audit, assets: [sourceAsset, fixedAsset] };
}

// Database initialization helper
import { frameworkRepository } from '../services/repositories/frameworkRepository';
import { diagnosisRepository } from '../services/repositories/diagnosisRepository';
import { auditRepository } from '../services/repositories/auditRepository';
import { assetRepository } from '../services/repositories/assetRepository';

export async function seedDatabaseIfEmpty(): Promise<void> {
  const existingFramework = await frameworkRepository.getLatest();
  if (!existingFramework) {
    await frameworkRepository.save(INITIAL_MASTER_FRAMEWORK);
  }

  const existingDiagnoses = await diagnosisRepository.getAll();
  if (existingDiagnoses.length === 0) {
    await diagnosisRepository.bulkSave(INITIAL_DIAGNOSES);
  }

  const currentFramework = (await frameworkRepository.getLatest()) || INITIAL_MASTER_FRAMEWORK;
  const existingAudits = await auditRepository.getAll(true);
  if (existingAudits.length === 0) {
    const { audit, assets } = buildDemoAudit(currentFramework);
    await auditRepository.save(audit);
    await assetRepository.bulkSave(assets);
  }
}
