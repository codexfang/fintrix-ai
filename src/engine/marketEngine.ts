import marketEventsData from '../data/marketEvents.json';

export interface SectorImpacts {
  tech: number;
  banking: number;
  energy: number;
  healthcare: number;
  consumer: number;
}

export interface MarketEvent {
  id: string;
  category: string;
  subcategory: string;
  severity: 'low' | 'medium' | 'high';
  keywords: string[];
  headlineTemplate: string;
  description: string;
  sectorImpacts: SectorImpacts;
  keyDrivers: string[];
  historicalEvents: Array<{
    date: string;
    headline: string;
    impact: string;
  }>;
}

export interface AnalysisResult {
  headline: string;
  event: MarketEvent;
  confidence: number;
  scaledImpacts: SectorImpacts;
  reasoning: string;
  matchedKeywords: string[];
  multiplier: number;
}

const stopwords = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'by', 'of', 'to', 'and', 'is', 'for', 'with', 
  'amid', 'as', 'about', 'from', 'into', 'over', 'under', 'through', 'after', 'before'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0 && !stopwords.has(word));
}

// Extract multiplier from headline based on basis points or percentages
function extractMultiplier(headline: string, template: string): { multiplier: number; explanation: string } {
  const headlineLower = headline.toLowerCase();
  const templateLower = template.toLowerCase();

  // Try to find numbers in basis points (bps)
  const bpsRegex = /(\d+)\s*(?:bps|basis\s+points?)/;
  const headlineBpsMatch = headlineLower.match(bpsRegex);
  const templateBpsMatch = templateLower.match(bpsRegex);

  if (headlineBpsMatch && templateBpsMatch) {
    const headlineVal = parseInt(headlineBpsMatch[1], 10);
    const templateVal = parseInt(templateBpsMatch[1], 10);
    if (templateVal > 0 && headlineVal > 0) {
      const mult = headlineVal / templateVal;
      // Cap multiplier at 4x and floor at 0.2x to keep predictions realistic
      const finalMult = Math.min(Math.max(mult, 0.2), 4.0);
      return {
        multiplier: finalMult,
        explanation: `Impact scaled by ${finalMult.toFixed(1)}x based on a matched rate change of ${headlineVal}bps vs baseline ${templateVal}bps.`
      };
    }
  }

  // Try to find percentages
  const pctRegex = /(\d+(?:\.\d+)?)\s*%/;
  const headlinePctMatch = headlineLower.match(pctRegex);
  const templatePctMatch = templateLower.match(pctRegex);

  if (headlinePctMatch && templatePctMatch) {
    const headlineVal = parseFloat(headlinePctMatch[1]);
    const templateVal = parseFloat(templatePctMatch[1]);
    if (templateVal > 0 && headlineVal > 0) {
      const mult = headlineVal / templateVal;
      const finalMult = Math.min(Math.max(mult, 0.2), 4.0);
      return {
        multiplier: finalMult,
        explanation: `Impact scaled by ${finalMult.toFixed(1)}x based on a percentage adjustment of ${headlineVal}% vs baseline ${templateVal}%.`
      };
    }
  }

  // Try to check for verbs like "surges 5%" or "drops 10%" in headline even if template has no percentage
  if (headlinePctMatch) {
    const headlineVal = parseFloat(headlinePctMatch[1]);
    // If it's a general headline and user inputted a large percentage, scale it
    if (headlineVal > 5) {
      const mult = headlineVal / 3.0; // 3% is average baseline
      const finalMult = Math.min(Math.max(mult, 0.5), 3.0);
      return {
        multiplier: finalMult,
        explanation: `Impact adjusted by ${finalMult.toFixed(1)}x in response to the high magnitude (${headlineVal}%) mentioned in the headline.`
      };
    }
  }

  return { multiplier: 1.0, explanation: '' };
}

export function analyzeHeadline(headline: string): AnalysisResult {
  if (!headline || headline.trim().length === 0) {
    return getNeutralResult(headline);
  }

  const headlineTokens = tokenize(headline);
  const headlineLower = headline.toLowerCase();
  
  let bestEvent: MarketEvent | null = null;
  let bestScore = -1;
  let bestMatchedKeywords: string[] = [];

  const marketEvents = marketEventsData as MarketEvent[];

  for (const event of marketEvents) {
    if (event.id === "EVT-NEUTRAL") continue;

    let matchCount = 0;
    const matched: string[] = [];

    // 1. Keyword overlap
    for (const keyword of event.keywords) {
      if (headlineTokens.includes(keyword) || headlineLower.includes(keyword)) {
        matchCount++;
        matched.push(keyword);
      }
    }

    if (matchCount === 0) continue;

    // Scoring formula: matches divided by square root of length of keywords
    // This gives a bonus to events that match a high proportion of their keywords,
    // while allowing slightly longer keyword lists to not be unfairly penalized.
    let score = matchCount / Math.sqrt(event.keywords.length);

    // 2. Phrase matching bonus
    // If exact multi-word phrases from the subcategory or templates match, give a massive boost
    const subcategoryWords = event.subcategory.toLowerCase().split(' ');
    if (subcategoryWords.length > 1 && headlineLower.includes(event.subcategory.toLowerCase())) {
      score += 1.5;
    }

    // Additional category checks for boosting
    if (event.category === "Monetary Policy") {
      if (headlineLower.includes("fed") || headlineLower.includes("federal reserve") || headlineLower.includes("powell")) {
        score += 0.5;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestEvent = event;
      bestMatchedKeywords = matched;
    }
  }

  // Threshold for matching
  const threshold = 0.4;
  if (!bestEvent || bestScore < threshold) {
    return getNeutralResult(headline);
  }

  // Determine scaling multiplier
  const { multiplier, explanation } = extractMultiplier(headline, bestEvent.headlineTemplate);

  // Scale sector impacts
  const scaledImpacts: SectorImpacts = {
    tech: parseFloat((bestEvent.sectorImpacts.tech * multiplier).toFixed(2)),
    banking: parseFloat((bestEvent.sectorImpacts.banking * multiplier).toFixed(2)),
    energy: parseFloat((bestEvent.sectorImpacts.energy * multiplier).toFixed(2)),
    healthcare: parseFloat((bestEvent.sectorImpacts.healthcare * multiplier).toFixed(2)),
    consumer: parseFloat((bestEvent.sectorImpacts.consumer * multiplier).toFixed(2))
  };

  // Compute confidence score
  // Scale score to a percentage capped at 98% and floor at 35% for any match
  let confidence = Math.round((bestScore / (bestEvent.keywords.length * 0.8)) * 100);
  confidence = Math.min(Math.max(confidence, 45), 98);

  // Generate dynamic reasoning text
  let reasoning = bestEvent.description;
  if (explanation) {
    reasoning = `${explanation}\n\n${reasoning}`;
  }

  return {
    headline,
    event: bestEvent,
    confidence,
    scaledImpacts,
    reasoning,
    matchedKeywords: bestMatchedKeywords,
    multiplier
  };
}

function getNeutralResult(headline: string): AnalysisResult {
  const neutralEvent = (marketEventsData as MarketEvent[]).find(e => e.id === "EVT-NEUTRAL")!;
  return {
    headline,
    event: neutralEvent,
    confidence: 0,
    scaledImpacts: { tech: 0, banking: 0, energy: 0, healthcare: 0, consumer: 0 },
    reasoning: "The headline does not contain strong macro, commodity, monetary policy, regulatory, or corporate earnings catalysts. The model predicts a neutral sector reaction, suggesting standard market trading noise and liquidity-driven movements will dominate.",
    matchedKeywords: [],
    multiplier: 1.0
  };
}
