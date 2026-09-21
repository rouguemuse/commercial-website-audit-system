/**
 * Copy Naturalness & Voice Scan Service
 * Detects synthetic, templated, formulaic AI writing cadences
 * and humanizes client-facing report deliverables.
 */

export interface VoiceScanFinding {
  tag: string;
  matchedSnippet: string;
  explanation: string;
  suggestedRewrite: string;
}

export interface VoiceScanResult {
  hasSyntheticPatterns: boolean;
  detectedTags: string[];
  findings: VoiceScanFinding[];
  cleanCopyRecommendation: string;
}

export function scanCopyForSyntheticPatterns(
  text: string,
  context?: { businessName?: string; brandVoiceSample?: string }
): VoiceScanResult {
  const findings: VoiceScanFinding[] = [];
  const detectedTags = new Set<string>();

  if (!text || text.trim().length === 0) {
    return {
      hasSyntheticPatterns: false,
      detectedTags: [],
      findings: [],
      cleanCopyRecommendation: ''
    };
  }

  // 1. AI-Style Contrast ("It's not just X, it's Y", "This isn't about X, it's about Y")
  const contrastRegex = /(?:it's not (?:just|about)|this (?:isn't|is not) (?:just|about)|we're not (?:just|merely))\s+([^.,—]+)[,.\s—]+(?:it's|it is|we're|it’s)\s+([^.]+)/i;
  const contrastMatch = text.match(contrastRegex);
  if (contrastMatch) {
    detectedTags.add('AI-style contrast');
    detectedTags.add('Formulaic phrasing');
    findings.push({
      tag: 'AI-style contrast',
      matchedSnippet: contrastMatch[0].trim(),
      explanation: 'Uses the classic synthetic "not just X, it\'s Y" symmetrical contrast construction.',
      suggestedRewrite: 'State the concrete outcome directly without the dramatic rhetorical contrast.'
    });
  }

  // 2. Em-Dash Overuse with Fragmented Cadence ("Fragment — em dash — payoff")
  const emDashCount = (text.match(/—|--/g) || []).length;
  if (emDashCount >= 2 || /([a-zA-Z\s]{4,25}—[a-zA-Z\s]{4,25}—[a-zA-Z\s]{4,25})/i.test(text)) {
    detectedTags.add('Em-dash overuse');
    detectedTags.add('Fragmented cadence');
    findings.push({
      tag: 'Em-dash overuse',
      matchedSnippet: 'Multiple dramatic em-dash fragments detected',
      explanation: 'Overuses em-dashes for manufactured dramatic tension where standard punctuation or a direct sentence reads more naturally.',
      suggestedRewrite: 'Replace em-dashes with standard commas or break into two straightforward sentences.'
    });
  }

  // 3. Forced Three-Part List / "Whether X, Y, or Z" / "From X to Y"
  const listRegex = /(?:whether you (?:need|are looking for)|from [^,]+, to [^,]+, to [^.]+)/i;
  const listMatch = text.match(listRegex);
  if (listMatch) {
    detectedTags.add('Unnatural list cadence');
    detectedTags.add('Formulaic phrasing');
    findings.push({
      tag: 'Unnatural list cadence',
      matchedSnippet: listMatch[0].trim(),
      explanation: 'Formulaic listing pattern that dilutes focus across multiple generic options.',
      suggestedRewrite: 'Highlight the single primary service and audience directly.'
    });
  }

  // 4. Abstract Buzzwords ("seamless", "tailored solutions", "empowering", "experience")
  const buzzwordRegex = /\b(seamlessly?|tailored solutions|empower(?:ing)?|holistic approach|digital experience|elevate your|transformative|solutions built around you|crafted to|designed to help you)\b/gi;
  const buzzMatches = text.match(buzzwordRegex);
  if (buzzMatches && buzzMatches.length >= 1) {
    detectedTags.add('Abstract wording');
    detectedTags.add('Generic marketing language');
    findings.push({
      tag: 'Abstract wording',
      matchedSnippet: Array.from(new Set(buzzMatches)).join(', '),
      explanation: 'Relies on corporate buzzword abstractions that provide zero operational details to a buyer.',
      suggestedRewrite: 'Replace abstract marketing jargon with concrete nouns and verbs describing the actual service.'
    });
  }

  // 5. Cliché CTA Language ("Ready to get started?", "Elevate your business today")
  const ctaClicheRegex = /\b(ready to (?:elevate|transform|take the next step|unlock)|experience the difference)\b/i;
  const ctaMatch = text.match(ctaClicheRegex);
  if (ctaMatch) {
    detectedTags.add('Cliché CTA language');
    findings.push({
      tag: 'Cliché CTA language',
      matchedSnippet: ctaMatch[0].trim(),
      explanation: 'Uses a generic canned call-to-action slogan that does not communicate the concrete next deliverable.',
      suggestedRewrite: 'Use direct outcome action wording (e.g., "Check Dumpster Availability in 60s" or "Book Free Roof Inspection").'
    });
  }

  // Generate clean voice recommendation
  let cleanRecommendation = '';
  if (context?.brandVoiceSample) {
    cleanRecommendation = `Align copy with the owner's authentic voice (${context.brandVoiceSample}) rather than synthetic agency templates.`;
  } else if (findings.length > 0) {
    cleanRecommendation = 'Rewrite using plainspoken, concrete trade language a business owner would say out loud to a customer.';
  }

  return {
    hasSyntheticPatterns: findings.length > 0,
    detectedTags: Array.from(detectedTags),
    findings,
    cleanCopyRecommendation: cleanRecommendation
  };
}

/**
 * Natural Language Sanitizer for Report Deliverables:
 * Cleans generated executive summaries, findings, and recommendations
 * of synthetic AI cadences before client display.
 */
export function sanitizeAndHumanizeDeliverableCopy(
  copy: string,
  brandVoiceSample?: string
): string {
  if (!copy) return copy;

  let cleaned = copy;

  // 1. Remove "It's not just X, it's Y" constructions
  cleaned = cleaned.replace(
    /(?:it's not just|this isn't just|we're not just)\s+([^,]+),\s*(?:it's|it is)\s+([^.]+)\./gi,
    '$2.'
  );

  // 2. Remove "designed to help you X" -> "helps you X" or "to X"
  cleaned = cleaned.replace(/\bdesigned to help you\b/gi, 'to');
  cleaned = cleaned.replace(/\bcrafted to provide\b/gi, 'providing');
  cleaned = cleaned.replace(/\btailored solutions for\b/gi, 'services for');
  cleaned = cleaned.replace(/\bseamless experience\b/gi, 'smooth process');
  cleaned = cleaned.replace(/\bexperience the difference\b/gi, 'get started');

  // 3. Tame excessive em-dashes (replace double em-dashes with natural punctuation)
  cleaned = cleaned.replace(/—\s*([^—]+)\s*—/g, ', $1,');

  return cleaned.trim();
}
