import React, { useState } from 'react';
import { Search, Layers, ArrowLeftRight, History, Trash2 } from 'lucide-react';

interface InputPanelProps {
  headlineA: string;
  headlineB: string;
  setHeadlineA: (val: string) => void;
  setHeadlineB: (val: string) => void;
  isCompareMode: boolean;
  setIsCompareMode: (val: boolean) => void;
  onAnalyze: (isCompare: boolean) => void;
  isLoading: boolean;
  searchHistory: string[];
  onHistoryClick: (headline: string) => void;
  onClearHistory: () => void;
}

const PRESET_CATEGORIES = [
  {
    name: 'Monetary Policy',
    presets: [
      'Federal Reserve raises interest rates by 50bps to combat core inflation pressures',
      'Powell signals upcoming 25bps rate cut at next month\'s FOMC meeting',
      'FOMC maintains benchmark interest rates unchanged citing economic stability'
    ]
  },
  {
    name: 'Macro & Inflation',
    presets: [
      'CPI inflation surges 8.2% higher, hitting fresh multi-year peaks',
      'Producer Price Index cools down unexpectedly, raising hope for rate pause',
      'Jobs report beats expectations with nonfarm payrolls jumping by 310k'
    ]
  },
  {
    name: 'Corporate & Tech',
    presets: [
      'Tech giants post record quarterly earnings and beat revenue estimates by 15%',
      'Wall Street banks miss profit guidance on rising consumer credit defaults',
      'Walmart warns of consumer demand slowdown and cuts full-year guidance'
    ]
  },
  {
    name: 'Energy & Commodities',
    presets: [
      'Oil prices surge 6% after OPEC+ announces unexpected crude production cuts',
      'Natural gas prices plummet 8% due to high reserves and mild winter forecast'
    ]
  },
  {
    name: 'Regulatory Actions',
    presets: [
      'DOJ launches antitrust probe targeting major software monopolies',
      'Regulators unveil Basel III capital requirements for regional banking sectors'
    ]
  }
];

export const InputPanel: React.FC<InputPanelProps> = ({
  headlineA,
  headlineB,
  setHeadlineA,
  setHeadlineB,
  isCompareMode,
  setIsCompareMode,
  onAnalyze,
  isLoading,
  searchHistory,
  onHistoryClick,
  onClearHistory
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Monetary Policy');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && headlineA.trim()) {
      onAnalyze(isCompareMode);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="panel-header-row">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <Search size={18} className="text-secondary" style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
            <span>Analysis Parameters</span>
          </h2>

          <button
            type="button"
            onClick={() => setIsCompareMode(!isCompareMode)}
            className="btn-secondary btn-compare-toggle"
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              borderColor: isCompareMode ? 'var(--accent-blue)' : 'var(--border-color)',
              color: isCompareMode ? 'var(--accent-blue)' : 'var(--text-secondary)',
              backgroundColor: isCompareMode ? 'var(--bg-accent-blue-light)' : 'var(--bg-card)',
              flexShrink: 0,
            }}
          >
            <ArrowLeftRight size={12} />
            <span>{isCompareMode ? 'Single Mode' : 'Compare Mode'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: 'var(--text-secondary)', 
              textTransform: 'uppercase', 
              marginBottom: '0.35rem' 
            }}>
              {isCompareMode ? 'Headline Alpha' : 'Financial Headline'}
            </label>
            <textarea
              value={headlineA}
              onChange={(e) => setHeadlineA(e.target.value)}
              placeholder="e.g. Federal Reserve increases benchmark interest rates by 25bps..."
              disabled={isLoading}
              style={{ minHeight: '80px' }}
            />
          </div>

          {isCompareMode && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                color: 'var(--text-secondary)', 
                textTransform: 'uppercase', 
                marginBottom: '0.35rem' 
              }}>
                Headline Beta
              </label>
              <textarea
                value={headlineB}
                onChange={(e) => setHeadlineB(e.target.value)}
                placeholder="e.g. Powell signals interest rate cut cycle as inflation cools..."
                disabled={isLoading}
                style={{ minHeight: '80px' }}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !headlineA.trim() || (isCompareMode && !headlineB.trim())}
          className="btn-primary"
          style={{ width: '100%' }}
        >
          {isLoading ? 'Analyzing Market Vectors...' : 'Analyze Market Impact'}
        </button>
      </form>

      {/* Preset Headlines Panel */}
      <div className="card">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={14} style={{ color: 'var(--accent-green)' }} />
          <span>Preset Impact Templates</span>
        </h3>
        
        {/* Category Tabs */}
        <div className="preset-tabs print-hidden">
          {PRESET_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActiveCategory(cat.name)}
              className={`preset-tab-btn${activeCategory === cat.name ? ' is-active' : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Preset List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
          {PRESET_CATEGORIES.find(c => c.name === activeCategory)?.presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className="btn-preset"
              onClick={() => {
                if (isCompareMode && headlineA && !headlineB) {
                  setHeadlineB(preset);
                } else {
                  setHeadlineA(preset);
                }
              }}
              title={preset}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* History Panel */}
      {searchHistory.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <History size={14} style={{ color: 'var(--text-muted)' }} />
              <span>Recent Searches</span>
            </h3>
            <button
              type="button"
              onClick={onClearHistory}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                padding: '2px',
                borderRadius: 'var(--radius-sm)'
              }}
              className="btn-secondary"
              title="Clear Search History"
            >
              <Trash2 size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto' }}>
            {searchHistory.map((historyHeadline, idx) => (
              <button
                key={idx}
                type="button"
                className="btn-preset"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                onClick={() => onHistoryClick(historyHeadline)}
                title={historyHeadline}
              >
                {historyHeadline}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default InputPanel;
