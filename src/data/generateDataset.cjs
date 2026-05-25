const fs = require('fs');
const path = require('path');

// Target path for the dataset
const outputPath = path.join(__dirname, 'marketEvents.json');

const events = [];

// Helper to generate unique IDs
let idCounter = 1;
function getNextId() {
  return `EVT-${String(idCounter++).padStart(3, '0')}`;
}

// ----------------------------------------------------
// CATEGORY 1: MONETARY POLICY (Rate cuts/hikes, central banks)
// ----------------------------------------------------
const fedEntities = ["Federal Reserve", "Fed", "FOMC", "Jerome Powell", "Powell", "Central bank"];
const hikeVerbs = ["raises", "increases", "hikes", "boosts", "elevates"];
const cutVerbs = ["cuts", "lowers", "slashes", "reduces", "decreases"];
const holdVerbs = ["holds", "pauses", "maintains", "keeps steady"];
const rateMagnitudes = ["25 basis points", "50 basis points", "75 basis points", "25bps", "50bps", "75bps", "0.25%", "0.5%", "0.75%"];

// Hawkish / Rate Hikes
for (const entity of fedEntities) {
  for (const verb of hikeVerbs) {
    for (const mag of rateMagnitudes) {
      const isAggressive = mag.includes("75") || mag.includes("0.75");
      events.push({
        id: getNextId(),
        category: "Monetary Policy",
        subcategory: "Rate Hike",
        severity: isAggressive ? "high" : "medium",
        keywords: [entity.toLowerCase(), "rate", ...verb.split(' '), ...mag.split(' '), "hike", "interest"],
        headlineTemplate: `${entity} ${verb} interest rates by ${mag}`,
        description: `Central bank interest rate hikes increase the cost of borrowing across the economy. Banks benefit from wider net interest margins, while growth sectors like technology suffer as their discounted future cash flows are worth less today. Consumer spending also cools as debt service costs rise.`,
        sectorImpacts: {
          tech: isAggressive ? -2.8 : -1.4,
          banking: isAggressive ? 2.2 : 1.2,
          energy: -0.5,
          healthcare: -0.4,
          consumer: isAggressive ? -1.8 : -0.9
        },
        keyDrivers: ["Interest Rates", "Cost of Capital", "Liquidity", "Consumer Demand"],
        historicalEvents: [
          { date: "2022-06-15", headline: "Fed hikes rates by 75bps to combat inflation", impact: "Tech -4.1%, Banks +1.5%" },
          { date: "2023-02-01", headline: "Powell announces 25 basis point interest rate hike", impact: "Tech -0.8%, Banks +0.5%" }
        ]
      });
    }
  }
}

// Dovish / Rate Cuts
for (const entity of fedEntities) {
  for (const verb of cutVerbs) {
    for (const mag of rateMagnitudes) {
      const isAggressive = mag.includes("75") || mag.includes("0.75");
      events.push({
        id: getNextId(),
        category: "Monetary Policy",
        subcategory: "Rate Cut",
        severity: isAggressive ? "high" : "medium",
        keywords: [entity.toLowerCase(), "rate", ...verb.split(' '), ...mag.split(' '), "cut", "interest"],
        headlineTemplate: `${entity} ${verb} benchmark rates by ${mag}`,
        description: `Interest rate cuts lower the cost of capital, providing liquidity to financial markets. High-growth sectors like technology experience valuation expansion due to lower discount rates. Banks generally see compressed net interest margins, while consumer sectors benefit from increased credit availability and spending power.`,
        sectorImpacts: {
          tech: isAggressive ? 3.2 : 1.8,
          banking: isAggressive ? -1.8 : -0.9,
          energy: 0.8,
          healthcare: 0.6,
          consumer: isAggressive ? 2.2 : 1.1
        },
        keyDrivers: ["Interest Rates", "Cost of Capital", "Liquidity", "Consumer Demand"],
        historicalEvents: [
          { date: "2020-03-03", headline: "Fed slashes interest rates by 50bps in emergency response", impact: "Tech +3.5%, Banks -2.8%" },
          { date: "2024-09-18", headline: "Jerome Powell announces 50 basis point rate reduction", impact: "Tech +2.1%, Banks -1.1%" }
        ]
      });
    }
  }
}

// Holds and Pauses
for (const entity of fedEntities) {
  for (const verb of holdVerbs) {
    events.push({
      id: getNextId(),
      category: "Monetary Policy",
      subcategory: "Rate Hold",
      severity: "low",
      keywords: [entity.toLowerCase(), "rate", ...verb.split(' '), "interest", "steady", "unchanged", "pause"],
      headlineTemplate: `${entity} ${verb} rates unchanged at current levels`,
      description: `Maintaining current interest rates indicates policy stability. Markets tend to react neutrally or slightly positively as uncertainty is removed, though highly leveraged growth sectors remain sensitive to hawkish or dovish commentary accompanying the decision.`,
      sectorImpacts: {
        tech: 0.4,
        banking: 0.1,
        energy: 0.2,
        healthcare: 0.3,
        consumer: 0.2
      },
      keyDrivers: ["Interest Rates", "Liquidity"],
      historicalEvents: [
        { date: "2023-11-01", headline: "Federal Reserve pauses rate hikes, keeping target range steady", impact: "Tech +1.2%, Banks +0.3%" }
      ]
    });
  }
}


// ----------------------------------------------------
// CATEGORY 2: INFLATION & MACRO DATA
// ----------------------------------------------------
const inflationKeywords = ["cpi", "inflation", "consumer prices", "producer prices", "ppi", "cost of living"];
const riseVerbs = ["surges", "spikes", "rises", "jumps", "climbs", "accelerates", "beats expectations"];
const fallVerbs = ["cools", "falls", "drops", "moderates", "slows", "misses expectations", "declines"];

// Rising Inflation
for (const indicator of inflationKeywords) {
  for (const verb of riseVerbs) {
    const isSevere = verb.includes("surge") || verb.includes("spike") || verb.includes("beat");
    events.push({
      id: getNextId(),
      category: "Inflation & CPI",
      subcategory: "High Inflation",
      severity: isSevere ? "high" : "medium",
      keywords: [...indicator.split(' '), ...verb.split(' '), "hot", "higher", "inflationary"],
      headlineTemplate: `${indicator} ${verb} higher, raising rate hike fears`,
      description: `Elevated inflation erodes consumer purchasing power and pressures profit margins due to rising input costs. It signals that the central bank may need to raise interest rates, which hits growth stocks (technology) hardest. Energy sectors often benefit as commodity prices rise.`,
      sectorImpacts: {
        tech: isSevere ? -2.2 : -1.1,
        banking: isSevere ? 0.8 : 0.4, // Banks benefit from potential hike expectations
        energy: isSevere ? 2.5 : 1.3,   // Energy costs drive inflation
        healthcare: -0.2,
        consumer: isSevere ? -1.6 : -0.8 // Margin pressure and lower real income
      },
      keyDrivers: ["Inflation", "Interest Rates", "Consumer Demand"],
      historicalEvents: [
        { date: "2022-09-13", headline: "CPI jumps 8.3%, hotter than expected, sparking market selloff", impact: "Tech -5.5%, Energy +0.2%" },
        { date: "2022-06-10", headline: "US inflation accelerates to 8.6%, highest since 1981", impact: "Tech -3.5%, Consumer -2.2%" }
      ]
    });
  }
}

// Falling/Cooling Inflation
for (const indicator of inflationKeywords) {
  for (const verb of fallVerbs) {
    const isSignificant = verb.includes("cools") || verb.includes("drop") || verb.includes("slow");
    events.push({
      id: getNextId(),
      category: "Inflation & CPI",
      subcategory: "Cooling Inflation",
      severity: isSignificant ? "medium" : "low",
      keywords: [...indicator.split(' '), ...verb.split(' '), "cool", "lower", "disinflation"],
      headlineTemplate: `${indicator} ${verb} indicating price pressures easing`,
      description: `Slowing inflation suggests monetary tightening is working and may end. Lower interest rate expectations boost growth stocks (technology) and consumer stocks due to lower capital costs and improved consumer sentiment. Banking may slip slightly on lower rate outlooks.`,
      sectorImpacts: {
        tech: isSignificant ? 1.9 : 0.8,
        banking: isSignificant ? -0.6 : -0.3,
        energy: isSignificant ? -1.2 : -0.5,
        healthcare: 0.4,
        consumer: isSignificant ? 1.5 : 0.7
      },
      keyDrivers: ["Inflation", "Interest Rates", "Consumer Demand"],
      historicalEvents: [
        { date: "2023-11-14", headline: "CPI inflation cools to 3.2%, sparking a massive market rally", impact: "Tech +3.2%, Consumer +1.9%" }
      ]
    });
  }
}


// ----------------------------------------------------
// CATEGORY 3: CORPORATE EARNINGS
// ----------------------------------------------------
const sectorsList = [
  { name: "Tech", keywords: ["tech", "semiconductor", "software", "apple", "microsoft", "nvidia", "silicon valley", "alphabet", "google", "meta"], techMod: 2.0, otherMod: 0.3 },
  { name: "Banking", keywords: ["banking", "bank", "jpmorgan", "goldman", "wall street", "financials", "credit suisse", "citigroup", "morgan stanley"], bankingMod: 2.0, otherMod: 0.2 },
  { name: "Energy", keywords: ["energy", "oil", "chevron", "exxon", "crude", "drilling", "refinery", "shell", "bp"], energyMod: 2.0, otherMod: 0.1 },
  { name: "Healthcare", keywords: ["healthcare", "pharma", "pfizer", "moderna", "biotech", "drugmaker", "johnson & johnson", "merck"], healthcareMod: 2.0, otherMod: 0.2 },
  { name: "Consumer", keywords: ["consumer", "retail", "walmart", "amazon", "target", "costco", "spending", "nike", "disney"], consumerMod: 2.0, otherMod: 0.4 }
];

const profitVerbs = ["beats estimates", "reports record earnings", "surpasses revenue guidance", "posts double-digit growth", "shatters profit expectations"];
const lossVerbs = ["misses estimates", "slashes guidance", "reports earnings miss", "warns of profit drop", "posts net loss"];

// Earnings Beats
for (const sector of sectorsList) {
  for (const verb of profitVerbs) {
    const impacts = { tech: 0.2, banking: 0.2, energy: 0.1, healthcare: 0.1, consumer: 0.2 };
    const lowercaseSector = sector.name.toLowerCase();
    impacts[lowercaseSector] = 2.4; // Strong positive impact on the reporting sector

    // Adjust other sectors based on synergy
    if (lowercaseSector === 'tech') {
      impacts.consumer = 0.6; // tech boosts consumer/retail platform stocks
    } else if (lowercaseSector === 'consumer') {
      impacts.tech = 0.5; // retail health boosts consumer electronics/software demand
    } else if (lowercaseSector === 'banking') {
      impacts.consumer = 0.4; // bank earnings indicate consumer credit health
    }

    events.push({
      id: getNextId(),
      category: "Corporate Earnings",
      subcategory: `${sector.name} Earnings Beat`,
      severity: "medium",
      keywords: [...sector.keywords, ...verb.split(' '), "earnings", "profit", "beat", "q1", "q2", "q3", "q4", "revenue"],
      headlineTemplate: `${sector.name} giants ${verb} in latest quarterly reports`,
      description: `Strong corporate earnings indicate resilient business fundamentals and robust customer demand. A positive earnings surprise inside the ${sector.name} sector generates direct capital inflows, boosts investor confidence, and lifts related industries through supply chain connections.`,
      sectorImpacts: impacts,
      keyDrivers: ["Consumer Demand", "Liquidity"],
      historicalEvents: [
        { date: "2023-05-24", headline: "Nvidia blows past earnings estimates, sparking AI market rally", impact: "Tech +24.3%, NASDAQ +2.5%" },
        { date: "2024-04-12", headline: "JPMorgan Chase beats quarterly earnings on higher interest income", impact: "Banks +3.2%, Tech +0.2%" }
      ]
    });
  }
}

// Earnings Misses
for (const sector of sectorsList) {
  for (const verb of lossVerbs) {
    const impacts = { tech: -0.2, banking: -0.2, energy: -0.1, healthcare: -0.1, consumer: -0.2 };
    const lowercaseSector = sector.name.toLowerCase();
    impacts[lowercaseSector] = -2.6; // Strong negative impact

    if (lowercaseSector === 'tech') {
      impacts.consumer = -0.7; // Tech slowdown drags consumer sentiment
    } else if (lowercaseSector === 'consumer') {
      impacts.tech = -0.6; // Weak retail spending points to slowing tech hardware upgrades
    } else if (lowercaseSector === 'banking') {
      impacts.tech = -0.5; // Tighter credit availability drags growth sectors
    }

    events.push({
      id: getNextId(),
      category: "Corporate Earnings",
      subcategory: `${sector.name} Earnings Miss`,
      severity: "high",
      keywords: [...sector.keywords, ...verb.split(' '), "earnings", "miss", "warns", "drop", "guidance", "weak"],
      headlineTemplate: `${sector.name} shares plunge as sector ${verb}`,
      description: `Disappointing financial performance and lower growth forecasts suggest macroeconomic cooling or margin squeeze from inflation/labor costs. Earnings misses lead to immediate valuation contraction in ${sector.name} and can signal broader demand headwinds for the entire market.`,
      sectorImpacts: impacts,
      keyDrivers: ["Consumer Demand", "Cost of Capital"],
      historicalEvents: [
        { date: "2022-02-03", headline: "Meta misses profit targets, slashes growth guidance; stock falls 26%", impact: "Tech -5.1%, Consumer -1.5%" },
        { date: "2023-10-24", headline: "Exxon Mobil reports Q3 profit drop as crude prices moderate", impact: "Energy -3.5%, Banks +0.1%" }
      ]
    });
  }
}


// ----------------------------------------------------
// CATEGORY 4: COMMODITY & ENERGY SHOCKS
// ----------------------------------------------------
const energyCommodities = ["oil prices", "crude oil", "brent crude", "natural gas", "energy costs", "fuel prices"];
const surgeVerbs = ["surges", "spikes", "rallies", "skyrockets", "climbs rapidly"];
const plungeVerbs = ["plunges", "craters", "drops", "tumbles", "slumps"];

// Oil/Energy Surges
for (const comm of energyCommodities) {
  for (const verb of surgeVerbs) {
    events.push({
      id: getNextId(),
      category: "Commodity Shock",
      subcategory: "Energy Price Surge",
      severity: "medium",
      keywords: [...comm.split(' '), ...verb.split(' '), "opec", "supply", "cut", "geopolitical"],
      headlineTemplate: `${comm} ${verb} amid production cuts and supply fears`,
      description: `Spike in global energy costs acts as a tax on consumers and corporate margins. Energy companies enjoy massive revenue increases and capital returns. Transport, technology, and consumer discretionaries suffer due to increased operational costs and pinched consumer discretionary budgets.`,
      sectorImpacts: {
        tech: -1.2,
        banking: -0.2,
        energy: 2.8,
        healthcare: -0.3,
        consumer: -1.5
      },
      keyDrivers: ["Energy Prices", "Inflation", "Consumer Demand"],
      historicalEvents: [
        { date: "2022-03-07", headline: "Brent crude spikes to $139/barrel on Russia oil embargo fears", impact: "Energy +6.5%, Tech -2.8%" },
        { date: "2023-04-03", headline: "OPEC+ announces surprise oil supply cuts; crude rises 6%", impact: "Energy +4.8%, Consumer -1.1%" }
      ]
    });
  }
}

// Oil/Energy Plunges
for (const comm of energyCommodities) {
  for (const verb of plungeVerbs) {
    events.push({
      id: getNextId(),
      category: "Commodity Shock",
      subcategory: "Energy Price Drop",
      severity: "medium",
      keywords: [...comm.split(' '), ...verb.split(' '), "inventory", "oversupply", "demand", "crude"],
      headlineTemplate: `${comm} ${verb} as global demand growth slows down`,
      description: `A drop in energy prices lowers input costs for manufacturers, shipping firms, and tech infrastructure (data centers). However, it directly damages energy sector earnings and capital reinvestment. Consumer sentiment gets a minor boost from lower gasoline costs.`,
      sectorImpacts: {
        tech: 0.7,
        banking: -0.1,
        energy: -3.2,
        healthcare: 0.2,
        consumer: 1.1
      },
      keyDrivers: ["Energy Prices", "Consumer Demand", "Inflation"],
      historicalEvents: [
        { date: "2020-04-20", headline: "Oil prices crash below zero in historic market shock", impact: "Energy -8.8%, Tech +0.5%" }
      ]
    });
  }
}


// ----------------------------------------------------
// CATEGORY 5: REGULATORY & POLICY ACTIONS
// ----------------------------------------------------
const regTopics = [
  { name: "Tech Antitrust", keywords: ["antitrust", "monopoly", "google", "apple", "meta", "justice department", "doj", "breakup", "ftc", "sec"], impacts: { tech: -2.5, banking: 0.1, energy: 0.0, healthcare: 0.0, consumer: -0.2 }, desc: "Regulatory lawsuits seeking to break up monopolies or restrict platform behavior threaten software sector margins, acquisition premiums, and capital spend." },
  { name: "Banking Capital Requirements", keywords: ["basel iii", "capital requirements", "reserve ratio", "federal reserve", "fdic", "banking regulation", "stress test"], impacts: { tech: -0.3, banking: -2.2, energy: -0.2, healthcare: -0.1, consumer: -0.4 }, desc: "Demanding banks hold higher capital reserves reduces leverage, limits lending profitability, and suppresses share buybacks and dividend payments." },
  { name: "Healthcare Reform & Drug Pricing", keywords: ["medicare", "drug prices", "price caps", "pharma regulation", "fda approval", "patents", "biotech bill"], impacts: { tech: 0.0, banking: 0.0, energy: 0.0, healthcare: -2.6, consumer: 0.2 }, desc: "Government price controls on pharmaceuticals and medical services directly compress healthcare profits, discouraging expensive clinical research R&D." }
];

const regVerbs = ["launches sweeping investigation into", "tightens regulations on", "faces strict antitrust scrutiny over", "proposes hard rules for", "imposes hefty penalties on"];

for (const topic of regTopics) {
  for (const verb of regVerbs) {
    events.push({
      id: getNextId(),
      category: "Regulatory Action",
      subcategory: topic.name,
      severity: "medium",
      keywords: [...topic.keywords, ...verb.split(' '), "regulation", "probe", "investigation", "fines", "compliance"],
      headlineTemplate: `Government ${verb} ${topic.name.toLowerCase()} compliance`,
      description: topic.desc,
      sectorImpacts: topic.impacts,
      keyDrivers: ["Regulatory Compliance", "Liquidity", "Cost of Capital"],
      historicalEvents: [
        { date: "2020-10-20", headline: "DOJ files historic antitrust lawsuit against Google", impact: "Tech -2.1%, S&P 500 -0.5%" },
        { date: "2023-07-27", headline: "Regulators unveil 'Basel III Endgame' rules requiring banks to hold 16% more capital", impact: "Banks -1.8%, Tech -0.2%" }
      ]
    });
  }
}


// ----------------------------------------------------
// CATEGORY 6: LABOR MARKET / JOBS
// ----------------------------------------------------
const laborKeywords = ["nonfarm payrolls", "jobs report", "unemployment rate", "jobless claims", "hiring data"];
const strongVerbs = ["beats expectations", "surges higher", "rises sharply", "shows tight labor market"];
const weakVerbs = ["misses estimates", "cools down", "plunges", "signals slowdown", "rises unexpectedly"];

// Strong Labor Market (Hawkish pressure)
for (const lab of laborKeywords) {
  for (const verb of strongVerbs) {
    events.push({
      id: getNextId(),
      category: "Labor Market",
      subcategory: "Strong Jobs Report",
      severity: "medium",
      keywords: [...lab.split(' '), ...verb.split(' '), "payrolls", "unemployment", "hiring", "wages"],
      headlineTemplate: `Labor market remains hot as ${lab} ${verb}`,
      description: `A tight labor market drives wage growth and consumer purchasing power, supporting consumer sectors. However, it fuels inflation worries and gives the Federal Reserve more leeway to hike or maintain higher interest rates, which exerts pressure on high-multiple growth (technology) sectors.`,
      sectorImpacts: {
        tech: -1.0,
        banking: 0.8,
        energy: 0.4,
        healthcare: 0.1,
        consumer: 0.5
      },
      keyDrivers: ["Consumer Demand", "Interest Rates", "Inflation"],
      historicalEvents: [
        { date: "2023-02-03", headline: "US jobs report blows past expectations with 517k jobs added", impact: "Tech -1.6%, Banks +1.1%" }
      ]
    });
  }
}

// Weak Labor Market (Dovish / Recession fears)
for (const lab of laborKeywords) {
  for (const verb of weakVerbs) {
    events.push({
      id: getNextId(),
      category: "Labor Market",
      subcategory: "Weak Jobs Report",
      severity: "high",
      keywords: [...lab.split(' '), ...verb.split(' '), "cooling", "miss", "jobless", "layoffs"],
      headlineTemplate: `Recession worries rise as labor market ${lab} ${verb}`,
      description: `Slowing job growth and rising unemployment signal economic cooling, raising concerns of a potential recession. Consumer discretionary sectors decline on demand worries. Technology stocks may experience mixed reactions: they benefit from falling rate yields but suffer from general corporate IT spend reductions.`,
      sectorImpacts: {
        tech: -0.5,
        banking: -1.5,
        energy: -1.8,
        healthcare: 0.3, // Defensive healthcare sector holds up
        consumer: -1.4
      },
      keyDrivers: ["Consumer Demand", "Interest Rates", "Liquidity"],
      historicalEvents: [
        { date: "2024-08-02", headline: "Disappointing jobs report sparks US recession fears, VIX surges", impact: "Tech -2.4%, Banks -3.5%" }
      ]
    });
  }
}

// ----------------------------------------------------
// DEFAULT/FALLBACK NEUTRAL EVENT
// ----------------------------------------------------
events.push({
  id: "EVT-NEUTRAL",
  category: "Macro Activity",
  subcategory: "Neutral Noise",
  severity: "low",
  keywords: ["neutral", "sideways", "noise", "speculation", "rumor"],
  headlineTemplate: "General market noise and geopolitical speculation",
  description: "Standard trading activity with no major structural catalysts. Market movements are driven by micro-liquidity flows, corporate press releases, and minor technical setups rather than overarching economic news.",
  sectorImpacts: {
    tech: 0.0,
    banking: 0.0,
    energy: 0.0,
    healthcare: 0.0,
    consumer: 0.0
  },
  keyDrivers: ["Liquidity"],
  historicalEvents: []
});

// Final check on size
console.log(`Generated ${events.length} financial event pattern templates.`);

// Write file
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(events, null, 2), 'utf-8');
console.log(`Successfully wrote dataset to: ${outputPath}`);
