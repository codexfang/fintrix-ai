import { useState, useEffect } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import ResultsDashboard from './components/ResultsDashboard';
import ComparisonDashboard from './components/ComparisonDashboard';
import { analyzeHeadline } from './engine/marketEngine';
import type { AnalysisResult } from './engine/marketEngine';
import { HelpCircle } from 'lucide-react';

function App() {
  // Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('fintrix-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light'; // Default to light mode (clean white background as requested)
  });

  // Headline Input States
  const [headlineA, setHeadlineA] = useState<string>('');
  const [headlineB, setHeadlineB] = useState<string>('');
  
  // Comparison & Results States
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [resultA, setResultA] = useState<AnalysisResult | null>(null);
  const [resultB, setResultB] = useState<AnalysisResult | null>(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingLines, setLoadingLines] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Synchronize theme with DOM document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fintrix-theme', theme);
  }, [theme]);

  // Load search history and last analysis from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('fintrix-history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    const savedLastAnalysis = localStorage.getItem('fintrix-last-analysis');
    if (savedLastAnalysis) {
      try {
        const parsed = JSON.parse(savedLastAnalysis);
        if (parsed.isCompare && parsed.headlineA && parsed.headlineB) {
          setIsCompareMode(true);
          setHeadlineA(parsed.headlineA);
          setHeadlineB(parsed.headlineB);
          setResultA(analyzeHeadline(parsed.headlineA));
          setResultB(analyzeHeadline(parsed.headlineB));
        } else if (parsed.headlineA) {
          setHeadlineA(parsed.headlineA);
          setResultA(analyzeHeadline(parsed.headlineA));
        }
      } catch (e) {
        console.error("Failed to load last analysis", e);
        loadDefaultAnalysis();
      }
    } else {
      loadDefaultAnalysis();
    }
  }, []);

  const loadDefaultAnalysis = () => {
    const defaultHeadline = 'Federal Reserve raises interest rates by 50bps to combat core inflation pressures';
    setHeadlineA(defaultHeadline);
    setResultA(analyzeHeadline(defaultHeadline));
  };

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Perform NLP Analysis with mock terminal-style ticker loading delay
  const handleAnalyze = (isCompare: boolean) => {
    setIsLoading(true);
    setLoadingLines([]);

    const steps = [
      '>> FINTRIX TERM: INITIALIZING DEEP NLP CLASSIFIER...',
      '>> CONNECTING TO MARKET EVENTS DATABASE [819 TEMPLATES]...',
      '>> TOKENIZING INPUT TEXT VECTOR & FILTERING CORRELATION NOISE...',
      '>> CALCULATING JACCARD SIMILARITIES & VECTOR SCORES...',
      '>> DETECTING MAGNITUDE MULTIPLIERS FROM NUMERICAL PATTERNS...',
      '>> EXTRAPOLATING HISTORICAL CORRELATIONS TO SECTOR DELTAS...',
      '>> ANALYTICAL PIPELINE RESOLVED.'
    ];

    let currentStep = 0;
    
    // Quick simulator of terminal prints
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setLoadingLines(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Compute actual results
        const resA = analyzeHeadline(headlineA);
        setResultA(resA);

        let resB: AnalysisResult | null = null;
        if (isCompare && headlineB) {
          resB = analyzeHeadline(headlineB);
          setResultB(resB);
        } else {
          setResultB(null);
        }

        // Update history
        updateHistory(headlineA, isCompare ? headlineB : '');

        // Save last analysis
        localStorage.setItem('fintrix-last-analysis', JSON.stringify({
          isCompare,
          headlineA,
          headlineB: isCompare ? headlineB : ''
        }));

        setIsLoading(false);
      }
    }, 200);
  };

  const updateHistory = (headA: string, headB: string) => {
    let updated = [...searchHistory];
    
    // Add Headline A if not already present
    if (headA && !updated.includes(headA)) {
      updated.unshift(headA);
    }
    // Add Headline B if not already present
    if (headB && !updated.includes(headB)) {
      updated.unshift(headB);
    }

    // Cap history size to 10
    updated = updated.slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem('fintrix-history', JSON.stringify(updated));
  };

  const handleHistoryClick = (clickedHeadline: string) => {
    if (isCompareMode) {
      if (!headlineA) {
        setHeadlineA(clickedHeadline);
      } else {
        setHeadlineB(clickedHeadline);
      }
    } else {
      setHeadlineA(clickedHeadline);
      // Immediately run analysis
      setIsLoading(true);
      setTimeout(() => {
        setResultA(analyzeHeadline(clickedHeadline));
        setIsLoading(false);
      }, 300);
    }
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('fintrix-history');
  };

  return (
    <div className="app-container">
      {/* Header component */}
      <Header theme={theme} onThemeToggle={handleThemeToggle} />
      
      {/* Main Terminal Grid */}
      <div className="dashboard-grid">
        {/* Left Side control and inputs */}
        <div className="print-hidden">
          <InputPanel
            headlineA={headlineA}
            headlineB={headlineB}
            setHeadlineA={setHeadlineA}
            setHeadlineB={setHeadlineB}
            isCompareMode={isCompareMode}
            setIsCompareMode={setIsCompareMode}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            searchHistory={searchHistory}
            onHistoryClick={handleHistoryClick}
            onClearHistory={handleClearHistory}
          />
        </div>

        {/* Right Side results outputs */}
        <div>
          {isLoading ? (
            <div className="card loader-container">
              <div className="spinner"></div>
              <div className="loader-terminal">
                <div style={{ color: 'var(--accent-blue)', fontWeight: 'bold', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                  FINTRIX AI NLP V4.1 ENGINE
                </div>
                {loadingLines.map((line, idx) => (
                  <div key={idx} style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.75rem', 
                    marginBottom: '0.25rem',
                    color: idx === loadingLines.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          ) : isCompareMode && resultA && resultB ? (
            <ComparisonDashboard 
              resultA={resultA} 
              resultB={resultB} 
              theme={theme} 
            />
          ) : resultA ? (
            <ResultsDashboard 
              result={resultA} 
              theme={theme} 
            />
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <HelpCircle size={48} style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--border-color-hover)' }} />
              <h3>No Analysis Loaded</h3>
              <p>Type a financial headline or click a preset on the left side to compile market vectors.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
