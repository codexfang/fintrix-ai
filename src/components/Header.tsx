import React, { useState, useEffect } from 'react';
import { Terminal, Sun, Moon, Activity } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onThemeToggle }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format time as UTC for a professional terminal feel
      const utcString = now.toUTCString().replace('GMT', 'UTC');
      setTime(utcString);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="card" style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          backgroundColor: 'var(--bg-accent-blue-light)', 
          color: 'var(--accent-blue)', 
          padding: '0.5rem', 
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(var(--accent-blue-rgb), 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Terminal size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            FINTRIX <span style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, marginTop: '-2px' }}>
            Market Impact Terminal
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div className="status-indicator">
          TERMINAL ACTIVE
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          fontFamily: 'var(--font-mono)', 
          fontSize: '0.75rem', 
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-page)',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)'
        }} className="print-hidden">
          <Activity size={12} className="text-secondary" style={{ animation: 'pulse-dot 2s infinite' }} />
          <span>{time}</span>
        </div>

        <button 
          onClick={onThemeToggle} 
          className="btn-secondary" 
          style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={theme === 'light' ? 'Switch to Dark Terminal' : 'Switch to Light Interface'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
};
export default Header;
