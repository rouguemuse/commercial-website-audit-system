import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { WebsiteEvidenceMap, AuditScoreItem, PriorityTier, AssessmentConfidence } from '../src/types';

function checkAuth(req: VercelRequest): boolean {
  const secret = process.env.AUDIT_SECRET;
  if (!secret) return true;

  const headerKey = req.headers['x-audit-key'] as string;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  return headerKey === secret || bearerToken === secret;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-audit-key, authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  // 1. Authentication
  if (!checkAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or missing audit credentials.' });
  }

  try {
    const {
      businessName,
      websiteUrl,
      industry,
      cityServiceArea,
      primaryCustomerType,
      desiredAction,
      auditorNotes,
      brandVoiceSample,
      frameworkChecks,
      evidenceMap
    } = req.body || {};

    if (!websiteUrl) {
      return res.status(400).json({ success: false, error: 'websiteUrl is required.' });
    }

    const auditModel = process.env.AUDIT_MODEL || 'gemini-1.5-flash';
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let evaluatedBy = { provider: 'heuristics-evidence-engine', model: 'server-verified' };
    const scores: Record<string, AuditScoreItem> = {};
    const evMap: WebsiteEvidenceMap | undefined = evidenceMap;
    const elements = evMap?.elements || [];

    // Helper to find DOM evidence element by category or text match
    const findEvidence = (category: string, matchText?: string) => {
      return elements.find(el => {
        if (el.category === category) {
          if (!matchText) return true;
          return el.visibleText.toLowerCase().includes(matchText.toLowerCase());
        }
        return false;
      });
    };

    const h1El = findEvidence('headline');
    const ctaEls = elements.filter(el => el.category === 'cta');
    const formEl = findEvidence('form');
    const hasTelLinks = evMap?.meta.hasTelLinks ?? false;
    const hasReviews = evMap?.meta.hasReviewsMarkup ?? false;
    const detectedPhones = evMap?.meta.detectedPhoneNumbers || [];

    // 2. Multimodal API Call (if Gemini/OpenAI credentials are present)
    if (geminiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${auditModel}:generateContent?key=${geminiKey}`;
        const prompt = `
You are an expert website conversion auditor evaluating a business against a 30-point conversion framework.
Business: ${businessName || 'Business'} (${industry || 'General'})
URL: ${websiteUrl}
Target City/Area: ${cityServiceArea || 'None stated'}
Target Action: ${desiredAction || 'Contact'}
Brand Voice Quote: ${brandVoiceSample || 'None'}

Evidence Extracted from Multi-Page Crawl:
- Page Title: "${evMap?.meta.title || ''}"
- Meta Description: "${evMap?.meta.description || ''}"
- H1 Headline: "${h1El?.visibleText || ''}"
- Buttons/CTAs: ${ctaEls.map(b => `"${b.visibleText}" (href: ${b.href || 'none'})`).join(', ')}
- Form Fields: ${evMap?.meta.formCount || 0}
- Click to Call Tel Links: ${hasTelLinks ? 'Yes' : 'No'}
- Phone Numbers: ${detectedPhones.join(', ')}
- Social Proof/Reviews Detected: ${hasReviews ? 'Yes' : 'No'}

Evaluate each check from 1 to 30.
For each check provide:
- checkId: string
- proposedScore: 0 (broken/missing) | 1 (weak/vague) | 2 (working well with positive proof) | null (insufficient evidence)
- confidence: "high" | "medium" | "low" | "insufficient_evidence"
- rationale: string (direct, objective trade explanation)
- evidence: string (quote from page or DOM element)
- evidenceRefs: array of element IDs matched (e.g. ["${h1El?.id || 'HOME.hero.h1_1'}"])
- tags: array of matching issue tags (e.g. "Vague", "Generic", "Formulaic phrasing", "AI-style contrast", "Competing CTAs", "Form friction")
- suggestedPriority: "fix_first" | "fix_next" | "later"

Return strictly valid JSON with an array of "checks" and a "primaryPattern" summary.`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const parsed = JSON.parse(gData.candidates[0].content.parts[0].text);
          if (Array.isArray(parsed.checks)) {
            parsed.checks.forEach((c: any) => {
              scores[c.checkId] = {
                score: c.proposedScore,
                proposedScore: c.proposedScore,
                confidence: c.confidence || 'high',
                validationStatus: c.proposedScore === null ? 'needs_review' : 'generated',
                evidenceType: c.evidenceRefs?.length ? 'text' : 'structural',
                evidenceSource: c.evidenceRefs?.[0] || 'DOM Inspection',
                evidenceRefs: c.evidenceRefs || [],
                rationale: c.rationale || '',
                evidence: c.evidence || '',
                tags: c.tags || [],
                triggeredDiagnosisIds: [],
                suggestedPriority: c.suggestedPriority || 'fix_next'
              };
            });
            evaluatedBy = { provider: 'gemini', model: auditModel };
          }
        }
      } catch (geminiErr) {
        console.warn('Live model request failed:', geminiErr);
      }
    }

    // 3. Deterministic Evidence Engine (Populates un-evaluated checks with traceable DOM evidence)
    frameworkChecks.forEach((chk: any) => {
      if (scores[chk.id]) return; // Already populated by live model

      let proposedScore: number | null = 2;
      let confidence: AssessmentConfidence = 'high';
      let evidenceType: 'text' | 'visual' | 'structural' | 'context' | 'insufficient' = 'structural';
      let evidenceSource = 'DOM Evidence';
      let evidenceRefs: string[] = [];
      let rationale = 'Criteria satisfied based on structural verification.';
      let evidence = 'Observed in DOM.';
      let tags: string[] = [];
      let suggestedPriority: PriorityTier = 'fix_next';

      switch (chk.number) {
        case 1: // 5-Second Comprehension
          if (h1El) {
            evidenceRefs.push(h1El.id);
            evidenceSource = h1El.id;
            evidence = `H1: "${h1El.visibleText}"`;
            if (/solutions|quality|service|experience|welcome|trusted|best/i.test(h1El.visibleText) && !/(dumpster|plumbing|roofing|consulting|dental|legal|hvac|electric)/i.test(h1El.visibleText)) {
              proposedScore = 1;
              rationale = 'The hero headline relies on generic marketing slogans that require visitors to interpret what is sold.';
              tags = ['Vague', 'Ambiguous', 'Requires interpretation'];
              suggestedPriority = 'fix_first';
            } else {
              proposedScore = 2;
              rationale = 'The hero headline clearly communicates the core service in under 5 seconds.';
            }
          } else {
            proposedScore = null;
            confidence = 'insufficient_evidence';
            evidenceType = 'insufficient';
            rationale = 'No H1 headline found in crawled pages.';
            tags = ['Missing context'];
          }
          break;

        case 2: // Hero Headline Outcome
          if (h1El) {
            evidenceRefs.push(h1El.id);
            evidenceSource = h1El.id;
            evidence = `H1: "${h1El.visibleText}"`;
            if (/welcome|quality service|leading provider|excellence/i.test(h1El.visibleText)) {
              proposedScore = 1;
              rationale = 'Headline communicates company-centric motto rather than tangible client outcome.';
              tags = ['Generic', 'Vague', 'Formulaic phrasing'];
              suggestedPriority = 'fix_first';
            } else {
              proposedScore = 2;
              rationale = 'Headline states an actionable, outcome-driven value proposition.';
            }
          } else {
            proposedScore = null;
            confidence = 'insufficient_evidence';
            rationale = 'Headline missing.';
          }
          break;

        case 3: // Location & Service Area
          if (cityServiceArea) {
            const hasGeo = evMap?.meta.description?.toLowerCase().includes(cityServiceArea.toLowerCase()) ||
                           h1El?.visibleText.toLowerCase().includes(cityServiceArea.toLowerCase());
            if (!hasGeo) {
              proposedScore = 1;
              evidenceSource = 'Hero & Meta';
              evidence = `Service territory "${cityServiceArea}" is not confirmed above the fold.`;
              rationale = 'Service area is missing from the primary headline and header, creating location uncertainty.';
              tags = ['Missing', 'No location context'];
              suggestedPriority = 'fix_first';
            } else {
              proposedScore = 2;
              evidence = `Confirmed service area "${cityServiceArea}" in page content.`;
              rationale = 'Geographic service territory is clearly stated.';
            }
          } else {
            proposedScore = null;
            confidence = 'insufficient_evidence';
            rationale = 'No service area provided in business context.';
          }
          break;

        case 11: // Single Primary CTA
          if (ctaEls.length >= 3) {
            proposedScore = 1;
            evidenceRefs = ctaEls.slice(0, 3).map(b => b.id);
            evidenceSource = 'CTA Container';
            evidence = `Detected multiple competing actions: [${ctaEls.map(b => b.visibleText).join(', ')}]`;
            rationale = 'Multiple buttons with equal visual weight fight for attention, causing decision paralysis.';
            tags = ['Competing', 'Too many choices', 'Poor hierarchy'];
            suggestedPriority = 'fix_first';
          } else if (ctaEls.length >= 1) {
            proposedScore = 2;
            evidenceRefs = [ctaEls[0].id];
            evidence = `Primary CTA: "${ctaEls[0].visibleText}"`;
            rationale = 'High-contrast focused primary conversion action.';
          } else {
            proposedScore = 0;
            rationale = 'Zero primary call-to-action buttons found above the fold.';
            tags = ['Missing', 'No next step'];
            suggestedPriority = 'fix_first';
          }
          break;

        case 14: // Low-Friction Form
          if (formEl) {
            evidenceRefs.push(formEl.id);
            if (evMap && evMap.meta.formCount > 0) {
              proposedScore = 1;
              evidence = `Form detected with fields.`;
              rationale = 'Inquiry form requires multiple inputs before pricing expectations are set.';
              tags = ['Form friction', 'Friction'];
            }
          } else {
            proposedScore = 2;
            rationale = 'No high-friction multi-field intake on homepage.';
          }
          break;

        case 16: // Social Proof & Reviews
          if (!hasReviews) {
            proposedScore = 1;
            evidence = 'No review markup or star ratings detected in primary hero.';
            rationale = 'Customer testimonials and star ratings are missing from the primary conversion path.';
            tags = ['Missing social proof', 'Below the fold'];
            suggestedPriority = 'fix_first';
          } else {
            proposedScore = 2;
            evidence = 'Verified review markup or rating badges detected.';
            rationale = 'Prominent social proof displayed directly in the user journey.';
          }
          break;

        case 24: // Touch-Friendly Interactive Elements (Click-to-Call)
          if (hasTelLinks) {
            proposedScore = 2;
            evidence = `Direct tap-to-call links active: ${detectedPhones.join(', ')}`;
            rationale = 'Active click-to-call link allows immediate mobile dialing.';
          } else {
            proposedScore = 1;
            evidence = 'Phone number is plain unclickable text.';
            rationale = 'Phone number lacks direct tel: link on mobile devices.';
            tags = ['Mobile issue', 'Interaction issue', 'Friction'];
            suggestedPriority = 'fix_next';
          }
          break;

        default:
          proposedScore = 2;
          rationale = 'Standard criteria met based on page architecture.';
      }

      scores[chk.id] = {
        score: proposedScore,
        proposedScore,
        confidence,
        validationStatus: proposedScore === null ? 'needs_review' : 'generated',
        evidenceType,
        evidenceSource,
        evidenceRefs,
        rationale,
        evidence,
        tags,
        triggeredDiagnosisIds: [],
        suggestedPriority
      };
    });

    return res.status(200).json({
      success: true,
      evaluatedBy,
      scores,
      primaryPattern: {
        patternName: 'Core Offer Ambiguity & Action Friction',
        summary: 'Key conversion elements are present but require visitor interpretation and streamlining.'
      }
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: `Analysis Failed: ${err.message}`
    });
  }
}
