import React, { useEffect, useRef } from 'react';

// written by @emielster — full medieval scene background

export const CastleBackground: React.FC = () => {
  return (
    <div className="scene-root">
      {/* Sky gradient */}
      <div className="scene-sky" />

      {/* Moon */}
      <div className="scene-moon">
        <div className="scene-moon-glow" />
      </div>

      {/* Stars */}
      <div className="scene-stars">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="scene-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Clouds — far back */}
      <div className="scene-clouds-far">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="scene-cloud scene-cloud-far" style={{ animationDelay: `${i * -14}s`, top: `${8 + i * 5}%` }} />
        ))}
      </div>

      {/* Clouds — mid */}
      <div className="scene-clouds-mid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="scene-cloud scene-cloud-mid" style={{ animationDelay: `${i * -20}s`, top: `${18 + i * 6}%` }} />
        ))}
      </div>

      {/* Bats */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="scene-bat"
          style={{
            top: `${10 + i * 7}%`,
            animationDelay: `${i * -6}s`,
            animationDuration: `${18 + i * 4}s`,
          }}
        >
          <BatSVG />
        </div>
      ))}

      {/* Far hill silhouette */}
      <div className="scene-hills-far" />

      {/* Castle SVG — centrepiece */}
      <div className="scene-castle-wrap">
        <CastleSVG />

        {/* Torch glow spots on castle */}
        <div className="scene-torch scene-torch-left">
          <div className="scene-torch-flame" />
        </div>
        <div className="scene-torch scene-torch-right">
          <div className="scene-torch-flame" />
        </div>
      </div>

      {/* Near hill / ground */}
      <div className="scene-hills-near" />

      {/* Ground fog */}
      <div className="scene-fog scene-fog-1" />
      <div className="scene-fog scene-fog-2" />
      <div className="scene-fog scene-fog-3" />
    </div>
  );
};

// ── Castle SVG ────────────────────────────────────────────────────────────────
const CastleSVG: React.FC = () => (
  <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" className="scene-castle-svg">
    {/* Main keep */}
    <rect x="130" y="100" width="140" height="180" fill="#0d0a14" />

    {/* Keep battlements */}
    {[130, 155, 180, 205, 230, 245].map((x, i) => (
      <rect key={i} x={x} y="85" width="18" height="20" fill="#0d0a14" />
    ))}

    {/* Left tower */}
    <rect x="80" y="120" width="70" height="160" fill="#110e1a" />
    {[80, 100, 120, 135].map((x, i) => (
      <rect key={i} x={x} y="106" width="16" height="18" fill="#110e1a" />
    ))}
    {/* Left tower roof */}
    <polygon points="80,120 150,120 115,60" fill="#1a0e2e" />

    {/* Right tower */}
    <rect x="250" y="120" width="70" height="160" fill="#110e1a" />
    {[250, 270, 290, 305].map((x, i) => (
      <rect key={i} x={x} y="106" width="16" height="18" fill="#110e1a" />
    ))}
    {/* Right tower roof */}
    <polygon points="250,120 320,120 285,60" fill="#1a0e2e" />

    {/* Gate arch */}
    <rect x="170" y="210" width="60" height="70" fill="#07050f" />
    <ellipse cx="200" cy="210" rx="30" ry="20" fill="#07050f" />

    {/* Portcullis lines */}
    {[175, 185, 195, 205, 215, 225].map((x, i) => (
      <line key={i} x1={x} y1="195" x2={x} y2="280" stroke="#1a1030" strokeWidth="2" />
    ))}
    {[205, 218, 231, 244, 257].map((y, i) => (
      <line key={i} x1="170" y1={y} x2="230" y2={y} stroke="#1a1030" strokeWidth="2" />
    ))}

    {/* Windows — glowing amber */}
    <ellipse cx="200" cy="140" rx="14" ry="18" fill="#3a1f00" />
    <ellipse cx="200" cy="140" rx="10" ry="14" fill="#ff9020" opacity="0.25" />

    <ellipse cx="115" cy="150" rx="10" ry="14" fill="#3a1f00" />
    <ellipse cx="115" cy="150" rx="7" ry="10" fill="#ff9020" opacity="0.2" />

    <ellipse cx="285" cy="150" rx="10" ry="14" fill="#3a1f00" />
    <ellipse cx="285" cy="150" rx="7" ry="10" fill="#ff9020" opacity="0.2" />

    {/* Flag on left tower */}
    <line x1="115" y1="60" x2="115" y2="30" stroke="#2a2040" strokeWidth="2" />
    <polygon points="115,30 140,38 115,46" fill="#8b1a1a" />

    {/* Flag on right tower */}
    <line x1="285" y1="60" x2="285" y2="30" stroke="#2a2040" strokeWidth="2" />
    <polygon points="285,30 310,38 285,46" fill="#8b1a1a" />

    {/* Wall connecting towers at base */}
    <rect x="0" y="220" width="80" height="60" fill="#0d0a14" />
    <rect x="320" y="220" width="80" height="60" fill="#0d0a14" />
    {/* Wall battlements */}
    {[0, 16, 32, 48, 64].map((x, i) => (
      <rect key={i} x={x} y="208" width="12" height="14" fill="#0d0a14" />
    ))}
    {[320, 336, 352, 368, 384].map((x, i) => (
      <rect key={i} x={x} y="208" width="12" height="14" fill="#0d0a14" />
    ))}

    {/* Moon reflection / light on keep */}
    <rect x="130" y="100" width="140" height="180" fill="url(#moonLight)" />
    <defs>
      <linearGradient id="moonLight" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c8b8ff" stopOpacity="0.07" />
        <stop offset="100%" stopColor="#c8b8ff" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

// ── Bat SVG ───────────────────────────────────────────────────────────────────
const BatSVG: React.FC = () => (
  <svg viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg" width="32" height="16">
    <path d="M20,10 Q12,2 2,6 Q8,10 10,14 Q14,8 20,10 Q26,8 30,14 Q32,10 38,6 Q28,2 20,10Z" fill="#1a1030" />
    <circle cx="20" cy="10" r="3" fill="#1a1030" />
  </svg>
);