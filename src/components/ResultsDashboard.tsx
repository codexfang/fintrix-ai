import React from 'react';
import { 
  TrendingUp, 
  FileText, 
  Activity, 
  BookOpen
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { AnalysisResult } from '../engine/marketEngine';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ResultsDashboardProps {
  result: AnalysisResult;
  theme: 'light' | 'dark';
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, theme }) => {
  const { event, confidence, scaledImpacts, reasoning, matchedKeywords } = result;

  // Chart configuration
  const sectorLabels = ['Tech', 'Banking', 'Energy', 'Healthcare', 'Consumer'];
  const sectorKeys = ['tech', 'banking', 'energy', 'healthcare', 'consumer'] as const;
  const dataValues = sectorKeys.map(key => scaledImpacts[key]);

  // Color helper based on theme and value polarity
  const getColors = () => {
    const isDark = theme === 'dark';
    const greenColor = isDark ? '#00e676' : '#10b981';
    const redColor = isDark ? '#ff1744' : '#ef4444';
    
    return dataValues.map(val => (val >= 0 ? greenColor : redColor));
  };

  const chartData = {
    labels: sectorLabels,
    datasets: [
      {
        label: 'Predicted % Shift',
        data: dataValues,
        backgroundColor: getColors(),
        borderRadius: 6,
        borderWidth: 0,
        barThickness: 32,
      },
    ],
  };

  const isDark = theme === 'dark';
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#0f172a',
        titleFont: { family: 'Outfit', size: 12, weight: 600 as const },
        bodyFont: { family: 'JetBrains Mono', size: 12 },
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            const val = context.parsed.y;
            return `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Outfit',
            size: 11,
            weight: 500 as const,
          },
          color: isDark ? '#94a3b8' : '#475569',
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            family: 'JetBrains Mono',
            size: 11,
          },
          color: isDark ? '#94a3b8' : '#475569',
          callback: (value: any) => `${value >= 0 ? '+' : ''}${value}%`,
        },
      },
    },
  };

  // SVG Radial Gauge logic
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  const getSeverityColor = () => {
    if (event.severity === 'high') return 'var(--accent-red)';
    if (event.severity === 'medium') return 'var(--accent-blue)';
    return 'var(--text-muted)';
  };

  const hasImpacts = dataValues.some(v => v !== 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. Hero Analysis Card */}
      <div className="card hero-analysis-card">
        {/* Radial Confidence Indicator */}
        <div className="confidence-gauge">
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke={isDark ? '#1e293b' : '#e2e8f0'}
              strokeWidth="8"
            />
            {/* Filled Progress Circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke={confidence > 0 ? 'var(--accent-blue)' : 'var(--text-muted)'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            />
          </svg>
          <div className="confidence-value">
            {confidence}%
            <span>Confidence</span>
          </div>
        </div>

        {/* Headline Classification details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{ 
              textTransform: 'uppercase', 
              fontSize: '0.65rem', 
              fontWeight: 700, 
              letterSpacing: '0.1em',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-accent-blue-light)',
              color: 'var(--accent-blue)',
              border: '1px solid rgba(var(--accent-blue-rgb), 0.15)'
            }}>
              {event.category}
            </span>
            <span style={{ 
              textTransform: 'uppercase', 
              fontSize: '0.65rem', 
              fontWeight: 700, 
              letterSpacing: '0.1em',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: event.severity === 'high' ? 'var(--bg-accent-red-light)' : 'var(--bg-page)',
              color: getSeverityColor(),
              border: `1px solid ${event.severity === 'high' ? 'rgba(239, 68, 68, 0.15)' : 'var(--border-color)'}`
            }}>
              {event.severity} Volatility
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem', lineHeight: 1.2 }}>
            {event.subcategory}
          </h2>
          <p className="interpretation-summary">
            {hasImpacts ? (
              <>
                Predicted reaction shows a high degree of divergence: positive for{' '}
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                  {sectorLabels[dataValues.indexOf(Math.max(...dataValues))]}
                </span>{' '}
                and negative for{' '}
                <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>
                  {sectorLabels[dataValues.indexOf(Math.min(...dataValues))]}
                </span>.
              </>
            ) : (
              'Macroeconomic signals suggest steady sideways trading with minimal immediate sector dislocation.'
            )}
          </p>
        </div>

        {/* Action Button: Export PDF/Print */}
        <div className="print-hidden">
          <button 
            onClick={handlePrint}
            className="btn-secondary"
            style={{ 
              padding: '0.5rem 0.85rem', 
              fontSize: '0.8rem', 
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <FileText size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. Visualizations and Insights Grid */}
      <div className="results-grid">
        
        {/* Left Column: Sector Shift Chart */}
        <div className="card" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <h3 className="card-title">
              <TrendingUp size={16} style={{ color: 'var(--accent-blue)' }} />
              <span>Projected Sector Movements</span>
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              BASIS POINTS DELTA
            </span>
          </div>
          <div style={{ flexGrow: 1, position: 'relative', height: '240px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Right Column: Natural Language Explanations */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <h3 className="card-title">
              <BookOpen size={16} style={{ color: 'var(--accent-green)' }} />
              <span>Market Insight & Analysis</span>
            </h3>
          </div>
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, flexGrow: 1 }}>
              {reasoning}
            </p>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Key Macro Drivers
              </span>
              <div className="key-drivers-list">
                {event.keyDrivers.map((driver) => (
                  <span key={driver} className="key-driver-tag" style={{
                    borderColor: 'var(--accent-blue)',
                    color: 'var(--accent-blue)',
                    backgroundColor: 'var(--bg-accent-blue-light)'
                  }}>
                    {driver}
                  </span>
                ))}
              </div>
            </div>
            
            {matchedKeywords.length > 0 && (
              <div className="print-hidden">
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Matched NLP Signatures
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {matchedKeywords.map((keyword) => (
                    <span key={keyword} style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.7rem', 
                      backgroundColor: 'var(--bg-page)', 
                      padding: '0.15rem 0.35rem', 
                      borderRadius: '4px',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)'
                    }}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. History Pattern Panel */}
      {event.historicalEvents && event.historicalEvents.length > 0 && (
        <div className="card">
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <h3 className="card-title">
              <Activity size={16} style={{ color: 'var(--text-muted)' }} />
              <span>Historical Precedents & Analogues</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              CORRELATION METRIC
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {event.historicalEvents.map((hist, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '100px 1fr auto', 
                  gap: '1rem', 
                  alignItems: 'center',
                  padding: '0.65rem 0.75rem',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {hist.date}
                </div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {hist.headline}
                </div>
                <div style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontWeight: 700, 
                  color: hist.impact.includes('-') && !hist.impact.includes('+') ? 'var(--accent-red)' : 'var(--accent-green)',
                  backgroundColor: hist.impact.includes('-') && !hist.impact.includes('+') ? 'var(--bg-accent-red-light)' : 'var(--bg-accent-green-light)',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '4px'
                }}>
                  {hist.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default ResultsDashboard;
