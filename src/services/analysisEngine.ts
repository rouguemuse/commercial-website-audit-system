import type {
  Audit,
  MasterFramework,
  Diagnosis,
  AuditAsset,
  AuditScoreItem,
  AuditFindingItem,
  PatternInsight,
  PriorityTier,
  AssessmentConfidence,
  ValidationStatus,
  ScoreState
} from '../types';
import { scanCopyForSyntheticPatterns } from './voiceScanService';

export interface AnalysisEngineResult {
  updatedScores: Record<string, AuditScoreItem>;
  consolidatedFindings: AuditFindingItem[];
  primaryPatternInsight: PatternInsight;
  summaryStats: {
    totalChecks: number;
    highConfidenceCount: number;
    needsConfirmationCount: number;
    insufficientEvidenceCount: number;
    potentialIssuesCount: number;
    suggestedFindingsCount: number;
    provisionalAudit: boolean;
  };
}

export function runPreAuditAnalysis(
  audit: Audit,
  framework: MasterFramework,
  diagnoses: Diagnosis[],
  assets: AuditAsset[]
): AnalysisEngineResult {
  const scores: Record<string, AuditScoreItem> = { ...audit.scores };
  const sourceAssets = assets.filter(a => a.type === 'source_of_truth');
  const allPins = sourceAssets.flatMap(a => a.pins);
  const bizContext = `${audit.businessName || ''} ${audit.industry || ''} ${audit.auditorNotes || ''}`.toLowerCase();
  const allObservedText = `${bizContext} ${allPins.map(p => p.title + ' ' + p.description).join(' ')}`;

  // Run Copy Naturalness & Voice scan on all supplied text
  const voiceScan = scanCopyForSyntheticPatterns(allObservedText, {
    businessName: audit.businessName,
    brandVoiceSample: audit.brandVoiceSample
  });

  // Helper to check pin sentiment for a check
  const getPinForCheck = (chkNumber: number, title: string) => {
    return allPins.find(p => {
      const pinText = `${p.title} ${p.description}`.toLowerCase();
      if (chkNumber === 1 && (pinText.includes('5-second') || pinText.includes('comprehension') || pinText.includes('headline') || pinText.includes('clarity') || pinText.includes('vague') || pinText.includes('slogan'))) return true;
      if (chkNumber === 2 && (pinText.includes('outcome') || pinText.includes('hero headline') || pinText.includes('motto') || pinText.includes('slogan'))) return true;
      if (chkNumber === 3 && (pinText.includes('location') || pinText.includes('service area') || pinText.includes('territory') || pinText.includes('city'))) return true;
      if (chkNumber === 10 && (pinText.includes('pricing') || pinText.includes('cost') || pinText.includes('how it works') || pinText.includes('steps'))) return true;
      if (chkNumber === 11 && (pinText.includes('cta') || pinText.includes('button') || pinText.includes('competing') || pinText.includes('primary action') || pinText.includes('direct cta'))) return true;
      if (chkNumber === 12 && (pinText.includes('wording') || pinText.includes('passive') || pinText.includes('button text'))) return true;
      if (chkNumber === 14 && (pinText.includes('form') || pinText.includes('friction') || pinText.includes('fields'))) return true;
      if (chkNumber === 16 && (pinText.includes('review') || pinText.includes('social proof') || pinText.includes('rating') || pinText.includes('testimonial') || pinText.includes('proof') || pinText.includes('logo'))) return true;
      if (chkNumber === 17 && (pinText.includes('stock') || pinText.includes('photo') || pinText.includes('imagery') || pinText.includes('authentic'))) return true;
      if (chkNumber === 21 && (pinText.includes('mobile') || pinText.includes('overlap') || pinText.includes('spacing') || pinText.includes('responsive'))) return true;
      if (chkNumber === 24 && (pinText.includes('tap') || pinText.includes('touch') || pinText.includes('phone') || pinText.includes('click-to-call') || pinText.includes('plain-text'))) return true;
      return pinText.includes(title.toLowerCase());
    });
  };

  framework.checks.forEach((chk) => {
    // Preserve already validated auditor manual work
    const existing = scores[chk.id];
    if (existing && (existing.validationStatus === 'validated' || existing.validationStatus === 'modified')) {
      return;
    }

    const pin = getPinForCheck(chk.number, chk.title);
    const pinText = pin ? `${pin.title} ${pin.description}`.toLowerCase() : '';
    const isExplicitlyNegativePin = pin && (
      pinText.includes('vague') ||
      pinText.includes('competing') ||
      pinText.includes('missing') ||
      pinText.includes('friction') ||
      pinText.includes('overlap') ||
      pinText.includes('broken') ||
      pinText.includes('generic') ||
      pinText.includes('stock') ||
      pinText.includes('zero') ||
      pinText.includes('requires interpretation') ||
      pinText.includes('plain-text') ||
      pinText.includes('unclickable') ||
      pinText.includes('buried') ||
      pinText.includes('cuts off')
    );

    const isExplicitlyPositivePin = pin && (
      pinText.includes('clear') ||
      pinText.includes('verified') ||
      pinText.includes('prominent') ||
      pinText.includes('active') ||
      pinText.includes('strong') ||
      pinText.includes('3-field') ||
      pinText.includes('instant') ||
      pinText.includes('tap-to-call') ||
      pinText.includes('direct cta') ||
      pinText.includes('logo strip') ||
      pinText.includes('outcome')
    );

    let scoreState: ScoreState = 'insufficient_evidence';
    let proposedScore: number = 1;
    let confidence: AssessmentConfidence = 'insufficient_evidence';
    let evidenceType: 'text' | 'visual' | 'structural' | 'context' | 'insufficient' = 'insufficient';
    let evidenceSource = 'Observed Page Evidence';
    let rationale = '';
    let evidence = '';
    let tags: string[] = [];
    let suggestedFinding = '';
    let suggestedPriority: PriorityTier = 'fix_next';

    // Heuristics based on extracted text and pin flags
    const hasVagueBuzzwords = /(transform|innovat|empower|future|possibility|solutions built|unlock|tomorrow|next-gen|synergy|creating change|global technology)/i.test(allObservedText);
    const hasConcreteServices = /(roof|repair|plumb|hvac|issue|track|software|development|accounting|legal|booking|dentist|detail|contractor|inspection|cleaning|commercial)/i.test(allObservedText);
    const hasPricingMentions = /(\$|[0-9]+\/mo|pricing|plans|rates|cost|free quote|free estimate)/i.test(allObservedText);
    const hasProcessSteps = /(how it works|step 1|3-step|our process|what to expect)/i.test(allObservedText);
    const hasReviews = /(★|reviews|ratings|testimonials|5\.0|4\.9|stars|trustpilot|google reviews|customers)/i.test(allObservedText);
    const hasPhone = /(tel:|call now|\([0-9]{3}\)|[0-9]{3}-[0-9]{3}-[0-9]{4})/i.test(allObservedText);
    const hasLogoProof = /(logo strip|customer logos|retool|vercel|ramp|cursor|stripe|enterprise customers)/i.test(allObservedText);

    switch (chk.number) {
      case 1: // 5-Second Comprehension
        if (isExplicitlyPositivePin || (hasConcreteServices && !hasVagueBuzzwords)) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          evidenceType = 'text';
          evidenceSource = 'Hero Headline';
          evidence = pin ? pin.description : 'Hero declares core offering and audience.';
          rationale = 'Value proposition and service offering are immediately clear in under 5 seconds.';
        } else if (isExplicitlyNegativePin || hasVagueBuzzwords) {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          evidenceType = 'text';
          evidenceSource = 'Hero Copy';
          evidence = pin ? pin.description : 'Headline uses abstract slogans requiring visitor interpretation.';
          rationale = 'The hero message forces visitors to guess or interpret what the company provides rather than stating it immediately.';
          tags = ['Vague', 'Ambiguous', 'Requires interpretation'];
          suggestedFinding = 'The core offer requires too much interpretation above the fold.';
          suggestedPriority = 'fix_first';
        } else {
          scoreState = 'insufficient_evidence';
          proposedScore = 1;
          confidence = 'insufficient_evidence';
          rationale = 'Hero copy requires auditor review to confirm 5-second clarity.';
        }
        break;

      case 2: // Hero Headline Outcome
        if (isExplicitlyPositivePin || (hasConcreteServices && !hasVagueBuzzwords)) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          evidenceType = 'text';
          evidenceSource = 'Hero Headline';
          evidence = 'Clear outcome statement in headline.';
          rationale = 'Headline communicates direct customer benefit and resolution.';
        } else if (isExplicitlyNegativePin || hasVagueBuzzwords) {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          evidenceType = 'text';
          evidenceSource = 'Hero Headline';
          evidence = pin ? pin.description : 'Company-centric motto observed.';
          rationale = 'Headline focuses on internal company claims rather than concrete customer outcomes.';
          tags = ['Generic', 'Vague'];
          suggestedFinding = 'Headline communicates company slogan rather than tangible client outcome.';
          suggestedPriority = 'fix_first';
        } else {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'medium';
          rationale = 'Headline communicates core benefit.';
        }
        break;

      case 3: // Location & Service Area
        if (isExplicitlyPositivePin || (audit.cityServiceArea && allObservedText.includes(audit.cityServiceArea.toLowerCase()))) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          evidenceType = 'text';
          evidenceSource = 'Header & Hero';
          evidence = `Service territory confirmed: ${audit.cityServiceArea || 'Regional / National'}`;
          rationale = 'Service area is clearly displayed or established.';
        } else if (isExplicitlyNegativePin) {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          evidenceType = 'text';
          evidenceSource = 'Above the fold copy';
          evidence = pin ? pin.description : 'Service area is missing above the fold.';
          rationale = 'Service territory is not confirmed above the fold, causing local searchers to bounce.';
          tags = ['Missing', 'No location context'];
          suggestedFinding = 'Geographic service territory is not confirmed above the fold.';
          suggestedPriority = 'fix_first';
        } else {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'medium';
          rationale = 'Territory scope is clear.';
        }
        break;

      case 4: // Visual Hierarchy
        if (isExplicitlyPositivePin) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          rationale = 'Clean visual separation of key elements.';
        } else if (isExplicitlyNegativePin) {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          rationale = 'Visual hierarchy has competing blocks.';
        } else {
          scoreState = 'insufficient_evidence';
          proposedScore = 1;
          confidence = 'insufficient_evidence';
          rationale = 'Requires screenshot inspection to verify typographic hierarchy and element contrast.';
        }
        break;

      case 5: // Immediate Next Action
        if (isExplicitlyPositivePin || allObservedText.includes('clear direct cta')) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          rationale = 'Prominent primary interactive action is visible above the fold.';
        } else if (isExplicitlyNegativePin) {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          rationale = 'Primary next action is missing or hidden.';
        } else {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'medium';
          rationale = 'Interactive next step is available.';
        }
        break;

      case 6: // Primary Services Comprehension
        if (hasConcreteServices) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          rationale = 'Primary service offerings are structured and labeled.';
        } else {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          rationale = 'Core service breakdown requires visitor interpretation.';
          tags = ['Unclear', 'Requires interpretation'];
        }
        break;

      case 7: // Unique Value Proposition
        if (isExplicitlyPositivePin || (hasConcreteServices && !hasVagueBuzzwords)) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          rationale = 'Differentiated speed or operational focus stated.';
        } else {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          rationale = 'Relies on standard quality claims without clear operational proof.';
          tags = ['Generic', 'Unsupported'];
        }
        break;

      case 8: // Customer-Centric Copy
        if (voiceScan.hasSyntheticPatterns || hasVagueBuzzwords) {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          evidenceType = 'text';
          evidenceSource = 'Hero & Body Copy';
          evidence = voiceScan.findings[0]?.matchedSnippet || 'Abstract corporate phrasing observed.';
          rationale = 'This says something positive without telling the customer anything distinctive about the business.';
          tags = ['Generic', 'Formulaic phrasing', 'Brand voice mismatch', ...voiceScan.detectedTags];
          suggestedPriority = 'fix_next';
        } else {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'medium';
          rationale = 'Messaging directly addresses customer outcomes and relief.';
        }
        break;

      case 9: // Objection Handling
        if (hasProcessSteps || allObservedText.includes('faq') || allObservedText.includes('warranty')) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          rationale = 'FAQ, process steps, or guarantees handle top objections.';
        } else {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          rationale = 'Top buyer objections and process questions are unaddressed.';
          tags = ['Missing', 'Friction'];
        }
        break;

      case 10: // Transparent Pricing & Process
        if (hasPricingMentions && hasProcessSteps) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          rationale = 'Clear process expectations and pricing guidance provided.';
        } else if (hasPricingMentions || hasProcessSteps) {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          evidenceType = 'structural';
          evidenceSource = 'Pricing & Process Block';
          evidence = 'Partial process or pricing guidance; missing complete transparent steps.';
          rationale = 'Clear starting baseline rates or structured process steps should be highlighted.';
          tags = ['Unclear next step'];
          suggestedFinding = 'Pricing opacity and missing "How It Works" steps create purchasing hesitation.';
          suggestedPriority = 'fix_next';
        } else {
          scoreState = 'broken';
          proposedScore = 0;
          confidence = 'high';
          evidenceType = 'structural';
          evidenceSource = 'Pricing Block';
          evidence = 'Zero transparent rates or "How It Works" steps detected.';
          rationale = 'Pricing opacity requires mystery phone call or custom quoting without baseline expectations.';
          tags = ['Missing', 'Friction', 'Unclear next step'];
          suggestedFinding = 'Pricing opacity and missing "How It Works" steps create purchasing hesitation.';
          suggestedPriority = 'fix_next';
        }
        break;

      case 11: // Single Primary Conversion Action
        if (isExplicitlyPositivePin || allObservedText.includes('clear direct cta')) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          evidenceType = 'structural';
          evidenceSource = 'Hero CTA';
          evidence = 'Single focused primary action.';
          rationale = 'High-contrast single primary conversion button.';
        } else if (isExplicitlyNegativePin || allObservedText.includes('competing action buttons')) {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          evidenceType = 'structural';
          evidenceSource = 'Hero CTA Container';
          evidence = pin ? pin.description : 'Multiple equal-weight buttons fight for attention.';
          rationale = 'Multiple buttons with equal visual weight create decision paralysis.';
          tags = ['Competing', 'Too many choices', 'Poor hierarchy'];
          suggestedFinding = 'Competing action buttons and form friction divide focus and stall inquiries.';
          suggestedPriority = 'fix_first';
        } else {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'medium';
        }
        break;

      case 12: // Specific CTA Wording
        if (allObservedText.includes('explore') || allObservedText.includes('learn more') || allObservedText.includes('read the report')) {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          rationale = 'Button copy uses passive, non-committal wording rather than specific outcome actions.';
          tags = ['Vague', 'Unclear next step'];
        } else {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          rationale = 'Action-oriented CTA wording.';
        }
        break;

      case 13: // Strategic CTA Frequency
        if (isExplicitlyNegativePin) {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          rationale = 'Long mid-page dead zones without a conversion prompt.';
        } else {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'medium';
          rationale = 'Recurring CTAs at key decision moments.';
        }
        break;

      case 14: // Low-Friction Forms
        if (isExplicitlyNegativePin || allObservedText.includes('high friction form')) {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          evidenceType = 'structural';
          evidenceSource = 'Inquiry Form';
          evidence = pin ? pin.description : 'Excessive required form fields before value is established.';
          rationale = 'Inquiry form demands too many initial fields, driving high abandonment.';
          tags = ['Form friction', 'Friction'];
          suggestedFinding = 'Excessive form fields create a barrier for mobile and high-intent visitors.';
          suggestedPriority = 'fix_first';
        } else {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'medium';
          rationale = 'Streamlined inquiry path.';
        }
        break;

      case 15: // Frictionless Path to Action
        if (isExplicitlyNegativePin) {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          rationale = 'Frictional navigation required to complete inquiry.';
        } else {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'medium';
          rationale = 'Direct path to action.';
        }
        break;

      case 16: // Social Proof & Reviews
        if (isExplicitlyPositivePin || hasLogoProof) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          evidenceType = 'text';
          evidenceSource = 'Hero Proof Module';
          evidence = pin ? pin.description : 'Prominent client proof / verified ratings displayed above the fold.';
          rationale = 'Verified customer proof is immediately visible in the primary conversion area.';
        } else if (isExplicitlyNegativePin || !hasReviews) {
          scoreState = isExplicitlyNegativePin && pinText.includes('buried') ? 'weak' : 'broken';
          proposedScore = isExplicitlyNegativePin && pinText.includes('buried') ? 1 : 0;
          confidence = 'high';
          evidenceType = 'structural';
          evidenceSource = 'Hero / Conversion Path';
          evidence = pin ? pin.description : 'Customer reviews or star ratings are missing from the primary conversion path.';
          rationale = 'Customer testimonials and proof elements are missing or buried away from decision areas.';
          tags = ['Missing social proof', 'Below the fold'];
          suggestedFinding = 'Strong local reviews and authentic project imagery are buried below the fold.';
          suggestedPriority = 'fix_first';
        } else {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          tags = ['Below the fold'];
        }
        break;

      case 17: // Authentic Visual Imagery
        if (isExplicitlyNegativePin || hasVagueBuzzwords) {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          rationale = 'Relies on generic corporate stock photos that disconnect from real operations.';
          tags = ['Stock/generic proof', 'Weak credibility'];
        } else if (allObservedText.includes('authentic product screenshots')) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          rationale = 'Authentic product or project imagery displayed.';
        } else {
          scoreState = 'insufficient_evidence';
          proposedScore = 1;
          confidence = 'insufficient_evidence';
          rationale = 'Requires visual image review to confirm photography authenticity.';
        }
        break;

      case 18: // Credentials & Trust Signals
        if (allObservedText.includes('license') || allObservedText.includes('insured') || allObservedText.includes('certified') || allObservedText.includes('security') || allObservedText.includes('enterprise') || allObservedText.includes('soc2')) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          rationale = 'Credentials and trust signals clearly displayed.';
        } else {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          rationale = 'Industry credentials or guarantees are unstated.';
        }
        break;

      case 19: // Verifiable Contact Info
        if (hasPhone || allObservedText.includes('@') || allObservedText.includes('contact')) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          rationale = 'Contact details are accessible.';
        } else {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          rationale = 'Direct contact channels are missing or unclear.';
        }
        break;

      case 20: // Current & Maintained Appearance
        scoreState = 'working_well';
        proposedScore = 2;
        confidence = 'high';
        rationale = 'Site is active and maintained.';
        break;

      case 21: // Mobile Layout Integrity
        if (isExplicitlyNegativePin || allObservedText.includes('horizontal scroll')) {
          scoreState = 'broken';
          proposedScore = 0;
          confidence = 'high';
          evidenceType = 'visual';
          evidenceSource = 'Mobile Viewport';
          evidence = pin ? pin.description : 'Mobile spacing overlap and horizontal overflow detected.';
          rationale = 'Mobile layout breaks with horizontal overflow and awkward spacing.';
          tags = ['Mobile issue', 'Readability'];
          suggestedFinding = 'Mobile experience suffers from layout overlap and spacing friction.';
          suggestedPriority = 'fix_first';
        } else {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'medium';
          rationale = 'Mobile viewport adapts cleanly.';
        }
        break;

      case 22: // Simple Navigation
        if (allObservedText.includes('competing') || isExplicitlyNegativePin) {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          rationale = 'Navigation has too many equal-weight top-level links.';
        } else {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          rationale = 'Focused navigation hierarchy.';
        }
        break;

      case 23: // Typography & Readability
        if (allObservedText.includes('wall of text')) {
          scoreState = 'broken';
          proposedScore = 0;
          confidence = 'high';
          rationale = 'Unbroken wall of text with poor line height and contrast.';
          tags = ['Readability', 'Too dense'];
        } else {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'medium';
          rationale = 'Typography is legible with adequate contrast.';
        }
        break;

      case 24: // Touch-Friendly Interactive Elements (Click-to-Call)
        if (isExplicitlyPositivePin || allObservedText.includes('click-to-call link active')) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          evidenceType = 'structural';
          evidenceSource = 'Header Call Button';
          evidence = 'Direct tap-to-call tel: link enabled.';
          rationale = 'Thumb-accessible tap targets and active click-to-call.';
        } else if (isExplicitlyNegativePin || allObservedText.includes('unclickable plain-text phone')) {
          scoreState = 'broken';
          proposedScore = 0;
          confidence = 'high';
          evidenceType = 'structural';
          evidenceSource = 'Header Phone';
          evidence = pin ? pin.description : 'Phone number is unclickable plain text on mobile.';
          rationale = 'Phone number is plain text and cannot be tapped directly on mobile devices.';
          tags = ['Mobile issue', 'Interaction issue', 'Friction'];
          suggestedFinding = 'Header phone number lacks direct tap-to-call link on mobile devices.';
          suggestedPriority = 'fix_next';
        } else if (hasPhone) {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'medium';
          rationale = 'Contact interactions are accessible.';
        } else {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          rationale = 'Web SaaS / product signup without mandatory phone requirement.';
        }
        break;

      case 25: // Clutter-Free Information Flow
        scoreState = 'working_well';
        proposedScore = 2;
        confidence = 'high';
        rationale = 'Clean presentation without obstructive overlays.';
        break;

      case 26: // Clear Page Titles & Headings
        if (allObservedText.includes('failed to crawl')) {
          scoreState = 'weak';
          proposedScore = 1;
          confidence = 'high';
          rationale = 'Page title is missing or uninformative.';
        } else {
          scoreState = 'working_well';
          proposedScore = 2;
          confidence = 'high';
          rationale = 'Descriptive page title and heading structure.';
        }
        break;

      case 27: // Geographic Language
        scoreState = 'working_well';
        proposedScore = 2;
        confidence = 'medium';
        rationale = 'Appropriate geographic or global market positioning.';
        break;

      case 28: // Crawlable Service Content
        scoreState = 'working_well';
        proposedScore = 2;
        confidence = 'high';
        rationale = 'Structured crawlable text content.';
        break;

      case 29: // Consistent NAP
        scoreState = 'working_well';
        proposedScore = 2;
        confidence = 'high';
        rationale = 'Standard business identification present.';
        break;

      case 30: // Structured Architecture
        scoreState = 'working_well';
        proposedScore = 2;
        confidence = 'high';
        rationale = 'Standard site architecture.';
        break;

      default:
        scoreState = 'insufficient_evidence';
        proposedScore = 1;
        confidence = 'insufficient_evidence';
        rationale = 'Standard evaluation.';
    }

    // Match diagnoses safely
    const matchedDiags = (diagnoses || []).filter(d =>
      d.triggers?.some(tr => tr.checkId === chk.id && tr.triggerScores.includes(proposedScore))
    );

    scores[chk.id] = {
      score: proposedScore,
      scoreState,
      proposedScore,
      confidence,
      validationStatus: confidence === 'insufficient_evidence' ? 'needs_review' : 'generated',
      evidenceType,
      evidenceSource,
      rationale,
      evidence,
      tags,
      triggeredDiagnosisIds: matchedDiags.map(d => d.id),
      suggestedFinding,
      suggestedPriority
    };
  });

  // Consolidate findings and identify primary patterns
  const consolidatedFindings = generateConsolidatedFindings(scores, framework, diagnoses);
  const patternInsight = detectWebsitePatterns(scores, framework);

  // Compute summary stats
  const scoreValues = Object.values(scores);
  const insufficientCount = scoreValues.filter(s => s.confidence === 'insufficient_evidence' || s.scoreState === 'insufficient_evidence').length;
  const summaryStats = {
    totalChecks: framework.checks.length,
    highConfidenceCount: scoreValues.filter(s => s.confidence === 'high').length,
    needsConfirmationCount: scoreValues.filter(s => s.confidence === 'medium' || s.confidence === 'low').length,
    insufficientEvidenceCount: insufficientCount,
    potentialIssuesCount: scoreValues.filter(s => (s.score ?? s.proposedScore ?? 2) < 2).length,
    suggestedFindingsCount: consolidatedFindings.length,
    provisionalAudit: insufficientCount > 0
  };

  return {
    updatedScores: scores,
    consolidatedFindings,
    primaryPatternInsight: patternInsight,
    summaryStats
  };
}

export function detectWebsitePatterns(
  scores: Record<string, AuditScoreItem>,
  framework: MasterFramework
): PatternInsight {
  const issues = Object.entries(scores).filter(([_, s]) => (s.score ?? s.proposedScore ?? 2) < 2);
  const tagCounts: Record<string, number> = {};
  const affectedCheckNumbers: number[] = [];

  issues.forEach(([checkId, s]) => {
    const chk = framework.checks.find(c => c.id === checkId);
    if (chk) affectedCheckNumbers.push(chk.number);
    (s.tags || []).forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });

  if (tagCounts['Vague'] || tagCounts['Ambiguous'] || tagCounts['Requires interpretation'] || tagCounts['Formulaic phrasing']) {
    return {
      patternName: 'Core Offer Ambiguity & High Visitor Interpretation',
      frequency: issues.length,
      summary: "The website's biggest leak is not missing content. Much of the information is present, but visitors repeatedly have to interpret what it means, which creates hesitation across the hero headline, service explanations, and call-to-action buttons.",
      affectedCheckNumbers,
      recommendation: "Rewrite above-the-fold messaging in concrete terms that declare the exact service and outcome without buzzwords."
    };
  }

  if (tagCounts['Competing'] || tagCounts['Form friction'] || tagCounts['Too many choices']) {
    return {
      patternName: 'High Action Friction & Competing Call-to-Actions',
      frequency: issues.length,
      summary: "Motivated buyers encounter multiple competing buttons, buried inquiry forms, and unclear next-step expectations that trigger decision paralysis.",
      affectedCheckNumbers,
      recommendation: "Establish ONE high-contrast primary conversion action with a streamlined 3-field instant inquiry."
    };
  }

  if (issues.length === 0) {
    return {
      patternName: 'High-Converting Conversion Architecture',
      frequency: 0,
      summary: 'Site demonstrates clear value communication, low-friction inquiry paths, and prominent trust signals.',
      affectedCheckNumbers: [],
      recommendation: 'Maintain high conversion hygiene and run targeted split tests.'
    };
  }

  return {
    patternName: 'Conversion Architecture Gaps',
    frequency: issues.length,
    summary: 'Identified opportunities to tighten clarity, reduce action friction, and elevate proof.',
    affectedCheckNumbers,
    recommendation: 'Address prioritized Fix First issues to maximize lead flow.'
  };
}

export function generateConsolidatedFindings(
  scores: Record<string, AuditScoreItem>,
  framework: MasterFramework,
  diagnoses: Diagnosis[]
): AuditFindingItem[] {
  const lowScores = Object.entries(scores).filter(([_, s]) => (s.score ?? s.proposedScore ?? 2) < 2);
  const findings: AuditFindingItem[] = [];

  // Group 1: Core Offer & Headline Clarity
  const clarityChecks = lowScores.filter(([_, s]) => (s.tags || []).some(t => ['Vague', 'Ambiguous', 'Requires interpretation', 'Generic'].includes(t)));
  if (clarityChecks.length > 0) {
    const primaryScore = clarityChecks[0][1];
    findings.push({
      id: 'finding_clarity_consolidated',
      diagnosisId: 'diag_generic_headline',
      checkId: clarityChecks[0][0],
      associatedCheckIds: clarityChecks.map(([id]) => id),
      tags: ['Clarity', 'Headline', 'Offer'],
      isConsolidated: true,
      tier: 'Critical',
      priority: 'Critical',
      effort: 'Low',
      order: 1,
      finding: 'Primary call-to-action and core offer headline are unclear above the fold',
      evidenceText: primaryScore?.evidence || 'Hero headline relies on abstract slogans requiring visitors to guess what is sold.',
      businessImpact: 'Visitors may leave without inquiring because they cannot determine what the company provides within the first 5 seconds.',
      recommendedAction: 'Rewrite the hero headline to state the exact service and tangible outcome in plain language.',
      whyItMatters: 'Visitors decide in 3–5 seconds whether they are in the right place. Abstract slogans force visitors to guess what the company provides, driving high bounce rates.',
      recommendedFix: 'Upgrade to a high-converting headline stating the exact service, target audience, and tangible outcome.',
      exampleImprovement: 'Before: "Transforming tomorrow through innovation" → After: "Commercial Facility Maintenance & Fast Dispatch Across the Metro Area."',
      customClientNotes: ''
    });
  }

  // Group 2: Action Engine & Form Friction
  const actionChecks = lowScores.filter(([_, s]) => (s.tags || []).some(t => ['Competing', 'Form friction', 'Too many choices', 'Friction'].includes(t)));
  if (actionChecks.length > 0) {
    const primaryScore = actionChecks[0][1];
    findings.push({
      id: 'finding_action_consolidated',
      diagnosisId: 'diag_competing_ctas',
      checkId: actionChecks[0][0],
      associatedCheckIds: actionChecks.map(([id]) => id),
      tags: ['Action', 'CTA', 'Friction'],
      isConsolidated: true,
      tier: 'High Impact',
      priority: 'High Impact',
      effort: 'Low',
      order: 2,
      finding: 'Multiple competing buttons appear above the fold without a clear primary conversion step',
      evidenceText: primaryScore?.evidence || 'Three or more competing buttons/links with equal visual weight observed in header and hero.',
      businessImpact: 'Prospective clients experience decision friction and hesitate rather than taking the next step.',
      recommendedAction: 'Consolidate competing options into one high-contrast primary "Request a Quote" button.',
      whyItMatters: 'When presented with multiple equal choices and passive links (Explore, Learn More), visitors experience analysis paralysis.',
      recommendedFix: 'Establish ONE high-contrast primary conversion action paired with a low-friction intake path.',
      exampleImprovement: 'Consolidate competing nav links into a single prominent "Request a Quote" button.',
      customClientNotes: ''
    });
  }

  // Group 3: Social Proof & Trust Signals
  const proofChecks = lowScores.filter(([_, s]) => (s.tags || []).some(t => ['Missing social proof', 'Below the fold', 'Stock/generic proof'].includes(t)));
  if (proofChecks.length > 0) {
    const primaryScore = proofChecks[0][1];
    findings.push({
      id: 'finding_proof_consolidated',
      diagnosisId: 'diag_missing_social_proof',
      checkId: proofChecks[0][0],
      associatedCheckIds: proofChecks.map(([id]) => id),
      tags: ['Trust', 'Reviews', 'Social Proof'],
      isConsolidated: true,
      tier: 'High Impact',
      priority: 'High Impact',
      effort: 'Medium',
      order: 3,
      finding: 'Credibility signals and customer proof are missing or buried below the fold',
      evidenceText: primaryScore?.evidence || 'No customer reviews, ratings, or verified trust badges visible in the primary viewport.',
      businessImpact: 'First-time visitors may doubt company reliability and leave to compare alternatives with visible reviews.',
      recommendedAction: 'Place a verified customer review badge or rating summary immediately below the primary hero action.',
      whyItMatters: 'First-time buyers worry about reliability and risk. Missing visible proof above the fold increases perceived risk.',
      recommendedFix: 'Embed a high-visibility social proof strip right below the hero headline with verified ratings and authentic photos.',
      exampleImprovement: 'Add "★ 4.9/5 from 200+ clients" directly below the hero CTA.',
      customClientNotes: ''
    });
  }

  // Group 4: Pricing & Process Transparency
  const pricingChecks = lowScores.filter(([_, s]) => (s.tags || []).some(t => ['Unclear next step', 'Missing'].includes(t)));
  if (pricingChecks.length > 0) {
    const primaryScore = pricingChecks[0][1];
    findings.push({
      id: 'finding_pricing_consolidated',
      diagnosisId: 'diag_unclear_pricing_process',
      checkId: pricingChecks[0][0],
      associatedCheckIds: pricingChecks.map(([id]) => id),
      tags: ['Pricing', 'Process'],
      isConsolidated: true,
      tier: 'Improvement',
      priority: 'Improvement',
      effort: 'Medium',
      order: 4,
      finding: 'Missing transparent pricing ranges or a clear "How It Works" step-by-step process',
      evidenceText: primaryScore?.evidence || 'No baseline pricing guidance or structured 3-step process explained on key pages.',
      businessImpact: 'Visitors uncertain of process or timeline often bounce rather than risk contacting sales without cost context.',
      recommendedAction: 'Add a 3-step process overview showing what happens after an inquiry is submitted.',
      whyItMatters: 'Uncertainty about cost ranges or fear of hidden fees causes prospects to bounce and compare transparent competitors.',
      recommendedFix: 'Introduce transparent starting baseline rates alongside a simple 3-step "How It Works" diagram.',
      exampleImprovement: 'Display starting packages alongside "1. Tell us your goals → 2. Scope confirmed → 3. Project kicked off".',
      customClientNotes: ''
    });
  }

  // Group 5: Mobile Interaction
  const mobileChecks = lowScores.filter(([_, s]) => (s.tags || []).some(t => ['Mobile issue', 'Interaction issue'].includes(t)));
  if (mobileChecks.length > 0) {
    const primaryScore = mobileChecks[0][1];
    findings.push({
      id: 'finding_mobile_consolidated',
      diagnosisId: 'diag_mobile_friction',
      checkId: mobileChecks[0][0],
      associatedCheckIds: mobileChecks.map(([id]) => id),
      tags: ['Mobile', 'Tap-to-call'],
      isConsolidated: true,
      tier: 'Critical',
      priority: 'Critical',
      effort: 'Low',
      order: 5,
      finding: 'Mobile interface lacks one-tap phone dialing or thumb-friendly call-to-actions',
      evidenceText: primaryScore?.evidence || 'Phone numbers rendered as plain unclickable text or buried behind mobile menus.',
      businessImpact: 'Mobile visitors on urgent timelines may abandon the site rather than manually copy/typing phone numbers.',
      recommendedAction: 'Hyperlink all phone numbers with active tel: links and add a sticky bottom mobile action bar.',
      whyItMatters: 'Over 65% of local searches happen on mobile devices where users need immediate thumb-accessible contact.',
      recommendedFix: 'Add a persistent mobile bottom action bar with direct "Tap to Call" and "Instant Quote" buttons.',
      exampleImprovement: 'Ensure phone numbers are hyperlinked with active `tel:` links.',
      customClientNotes: ''
    });
  }

  return findings;
}
