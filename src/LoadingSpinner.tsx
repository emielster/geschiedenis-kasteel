

import React from 'react';
import './styles.css'; 

export const SpinnerCircle: React.FC = () => (
  <div className="loader" />
);

export const LoadingDots: React.FC<{ text?: string }> = ({ text = 'Loading' }) => (
  <div style={{ textAlign: 'center' }}>
    <div className="loading-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <p style={{ color: 'var(--text)', marginTop: '12px', fontSize: '0.9rem' }}>
      {text}
    </p>
  </div>
);

export const SkeletonLoader: React.FC = () => (
  <div style={{ width: '100%' }}>
    <div className="skeleton skeleton-text" />
    <div className="skeleton skeleton-text" style={{ width: '80%' }} />
    <div className="skeleton skeleton-button" style={{ marginTop: '20px' }} />
  </div>
);

export const ConnectionStatus: React.FC<{ isReady: boolean }> = ({ isReady }) => (
  <div style={{ 
    fontSize: '0.85rem', 
    color: isReady ? 'var(--success)' : 'var(--blue)', 
    marginBottom: '16px', 
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  }}>
    <div style={{
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: isReady ? 'var(--success)' : 'var(--blue)',
      animation: isReady ? 'none' : 'pulse 1s infinite'
    }} />
    {isReady ? 'Connected' : 'Connecting...'}
  </div>
);

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Loading game...' }) => (
  <div style={{
    position: 'fixed',
    inset: 0,
    background: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '20px',
    backdropFilter: 'blur(4px)',
    zIndex: 100
  }}>
    <SpinnerCircle />
    <p style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 500 }}>
      {message}
    </p>
  </div>
);