import React from 'react';
import { 
  ArrowLeftRight, 
  TrendingUp, 
  BookOpen, 
  Percent, 
  FileText
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import type { AnalysisResult } from '../engine/marketEngine';

interface ComparisonDashboardProps {
  resultA: AnalysisResult;
  resultB: AnalysisResult;
  theme: 'light' | 'dark';
}

export const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ resultA, resultB, theme }) => {
  // Chart configuration
  const sectorLabels = ['Tech', 'Banking', 'Energy', 'Healthcare', 'Consumer'];
  const sectorKeys = ['tech', 'banking', 'energy', 'healthcare', 'consumer'] as const;

  const dataA = sectorKeys.map(key => resultA.scaledImpacts[key]);
  const dataB = sectorKeys.map(key => resultB.scaledImpacts[key]);

  const isDark = theme === 'dark';
  
  // Custom colors for comparison
  const colorA = isDark ? '#00e5ff' : '#2563eb'; // Blue
  const colorB = isDark ? '#00e676' : '#10b981'; // Green

  const chartData = {
    labels: sectorLabels,
    datasets: [
      {
        label: 'Headline Alpha',
        data: dataA,
        backgroundColor: colorA,
        borderRadius: 4,
        barThickness: 16,
      },
      {
        label: 'Headline Beta',
        data: dataB,
        backgroundColor: colorB,
        borderRadius: 4,
        barThickness: 16,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: { family: 'Outfit', size: 12, weight: 500 as const },
          color: isDark ? '#ffffff' : '#0f172a',
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#0f172a',
        titleFont: { family: 'Outfit', size: 12, weight: 600 as const },
        bodyFont: { family: 'JetBrains Mono', size: 12 },
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label;
            const val = context.parsed.y;
            return `${label}: ${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
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

  // Calculate sector deltas (B - A)
  const deltas = sectorKeys.map((_, i) => ({
    sector: sectorLabels[i],
    valA: dataA[i],
    valB: dataB[i],
    diff: parseFloat((dataB[i] - dataA[i]).toFixed(2))
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. Comparison Summary Badges */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeftRight size={18} style={{ color: 'var(--accent-blue)' }} />
            <span>Differential Vector Analysis</span>
          </h2>
          <button 
            onClick={handlePrint}
            className="btn-secondary print-hidden"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
          >
            <FileText size={12} />
            <span>Export Comparison</span>
          </button>
        </div>

        <div className="compare-header-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ borderLeft: `3px solid ${colorA}`, paddingLeft: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.25rem' }}>
              <span className="impact-badge" style={{ backgroundColor: 'var(--bg-accent-blue-light)', color: colorA, fontSize: '0.65rem' }}>
                ALPHA / {resultA.event.category.toUpperCase()}
              </span>
              <span className="impact-badge" style={{ backgroundColor: 'var(--bg-page)', fontSize: '0.65rem' }}>
                {resultA.confidence}% CONF
              </span>
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {resultA.event.subcategory}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              "{resultA.headline}"
            </p>
          </div>

          <div style={{ borderLeft: `3px solid ${colorB}`, paddingLeft: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.25rem' }}>
              <span className="impact-badge" style={{ backgroundColor: 'var(--bg-accent-green-light)', color: colorB, fontSize: '0.65rem' }}>
                BETA / {resultB.event.category.toUpperCase()}
              </span>
              <span className="impact-badge" style={{ backgroundColor: 'var(--bg-page)', fontSize: '0.65rem' }}>
                {resultB.confidence}% CONF
              </span>
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {resultB.event.subcategory}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              "{resultB.headline}"
            </p>
          </div>
        </div>
      </div>

      {/* 2. Visualizations and Delta Grid */}
      <div className="results-grid">
        
        {/* Left Column: Grouped Sector Chart */}
        <div className="card" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <h3 className="card-title">
              <TrendingUp size={16} style={{ color: 'var(--accent-blue)' }} />
              <span>Comparative Performance Profile</span>
            </h3>
          </div>
          <div style={{ flexGrow: 1, position: 'relative', height: '240px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Right Column: Delta Spreadsheet */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <h3 className="card-title">
              <Percent size={16} style={{ color: 'var(--accent-green)' }} />
              <span>Delta Spreadsheet</span>
            </h3>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.5rem' }}>Sector</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Alpha</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Beta</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Delta</th>
              </tr>
            </thead>
            <tbody>
              {deltas.map((d, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>{d.sector}</td>
                  <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {d.valA >= 0 ? '+' : ''}{d.valA.toFixed(2)}%
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {d.valB >= 0 ? '+' : ''}{d.valB.toFixed(2)}%
                  </td>
                  <td style={{ 
                    padding: '0.65rem 0.5rem', 
                    textAlign: 'right', 
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: d.diff > 0 ? 'var(--accent-green)' : d.diff < 0 ? 'var(--accent-red)' : 'inherit'
                  }}>
                    {d.diff > 0 ? '+' : ''}{d.diff.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Detailed Side-by-Side Rationale */}
      <div className="results-grid">
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: colorA, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <BookOpen size={14} />
            <span>Alpha Insights</span>
          </h3>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
            {resultA.reasoning}
          </p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: colorB, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <BookOpen size={14} />
            <span>Beta Insights</span>
          </h3>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
            {resultB.reasoning}
          </p>
        </div>
      </div>
    </div>
  );
};
export default ComparisonDashboard;
