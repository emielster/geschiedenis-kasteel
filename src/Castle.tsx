// written by @emielster — full medieval scene background

export const CastleBackground: React.FC = () => {
  return (
    <div className="scene-root">
      {/* Sky gradient */}
      <div className="scene-sky" />

      {/* Aurora shimmer behind moon */}
      <div className="scene-aurora" />

      {/* Moon */}
      <div className="scene-moon">
        <div className="scene-moon-glow" />
        <div className="scene-moon-crater" style={{ width: 11, height: 11, top: '18%', left: '28%' }} />
        <div className="scene-moon-crater" style={{ width: 7, height: 7, top: '52%', left: '58%' }} />
        <div className="scene-moon-crater" style={{ width: 5, height: 5, top: '30%', left: '62%' }} />
      </div>

      {/* Shooting star */}
      <div className="scene-shooting-star" />

      {/* Stars */}
      <div className="scene-stars">
        {Array.from({ length: 90 }).map((_, i) => (
          <div
            key={i}
            className="scene-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 65}%`,
              width: `${1 + Math.random() * 2.5}px`,
              height: `${1 + Math.random() * 2.5}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Clouds — far back */}
      <div className="scene-clouds-far">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="scene-cloud scene-cloud-far" style={{ animationDelay: `${i * -12}s`, top: `${5 + i * 5}%` }} />
        ))}
      </div>

      {/* Clouds — mid */}
      <div className="scene-clouds-mid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="scene-cloud scene-cloud-mid" style={{ animationDelay: `${i * -16}s`, top: `${16 + i * 5}%` }} />
        ))}
      </div>

      {/* Bats */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="scene-bat"
          style={{
            top: `${8 + i * 6}%`,
            animationDelay: `${i * -5}s`,
            animationDuration: `${16 + i * 4}s`,
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
          <div className="scene-torch-glow" />
        </div>
        <div className="scene-torch scene-torch-right">
          <div className="scene-torch-flame" />
          <div className="scene-torch-glow" />
        </div>
      </div>

      {/* Near hill / ground */}
      <div className="scene-hills-near" />

      {/* Ground fog — four layers */}
      <div className="scene-fog scene-fog-1" />
      <div className="scene-fog scene-fog-2" />
      <div className="scene-fog scene-fog-3" />
      <div className="scene-fog scene-fog-4" />
    </div>
  );
};

// ── Castle SVG ──────────────────────────────────────────────────────────────────────────
const CastleSVG: React.FC = () => (
  <svg viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg" className="scene-castle-svg">
    <defs>
      <linearGradient id="moonLight" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c8b8ff" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#c8b8ff" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* === MOAT / WATER === */}
    <ellipse cx="300" cy="336" rx="295" ry="14" fill="#030210" />
    <ellipse cx="300" cy="332" rx="275" ry="9" fill="#070520" />
    {/* water shimmer reflections */}
    <ellipse cx="255" cy="330" rx="80" ry="4" fill="rgba(80,55,160,0.18)" />
    <ellipse cx="380" cy="331" rx="60" ry="3" fill="rgba(60,45,130,0.12)" />
    <ellipse cx="150" cy="332" rx="40" ry="2" fill="rgba(70,50,150,0.1)" />

    {/* === CURTAIN WALLS (outermost) === */}
    {/* Left curtain wall */}
    <rect x="0" y="228" width="88" height="112" fill="#0c0918" />
    {[0, 14, 28, 42, 56, 70].map((x, i) => (
      <rect key={i} x={x} y="215" width="11" height="15" fill="#0c0918" />
    ))}
    {/* curtain wall slit */}
    <rect x="36" y="248" width="8" height="22" rx="4" fill="#06040c" />

    {/* Right curtain wall */}
    <rect x="512" y="228" width="88" height="112" fill="#0c0918" />
    {[512, 526, 540, 554, 568, 582].map((x, i) => (
      <rect key={i} x={x} y="215" width="11" height="15" fill="#0c0918" />
    ))}
    <rect x="556" y="248" width="8" height="22" rx="4" fill="#06040c" />

    {/* === OUTER LEFT TOWER === */}
    <rect x="18" y="158" width="92" height="182" fill="#0f0b1c" />
    {/* battlements */}
    {[18, 33, 48, 63, 78, 92].map((x, i) => (
      <rect key={i} x={x} y="144" width="12" height="16" fill="#0f0b1c" />
    ))}
    {/* conical roof */}
    <polygon points="10,158 118,158 64,74" fill="#130927" />
    {/* roof sheen — left face lit by moon */}
    <polygon points="10,158 64,158 64,74" fill="rgba(180,155,255,0.06)" />
    {/* arrow slit */}
    <rect x="60" y="278" width="8" height="20" rx="4" fill="#06040c" />
    {/* flag */}
    <line x1="64" y1="74" x2="64" y2="40" stroke="#221838" strokeWidth="2.5" />
    <polygon points="64,40 100,50 64,60" fill="#7a1515" />

    {/* === OUTER RIGHT TOWER === */}
    <rect x="490" y="158" width="92" height="182" fill="#0f0b1c" />
    {[490, 505, 520, 535, 550, 564].map((x, i) => (
      <rect key={i} x={x} y="144" width="12" height="16" fill="#0f0b1c" />
    ))}
    <polygon points="482,158 590,158 536,74" fill="#130927" />
    <polygon points="536,158 590,158 536,74" fill="rgba(180,155,255,0.06)" />
    <rect x="532" y="278" width="8" height="20" rx="4" fill="#06040c" />
    <line x1="536" y1="74" x2="536" y2="40" stroke="#221838" strokeWidth="2.5" />
    <polygon points="536,40 572,50 536,60" fill="#7a1515" />

    {/* === MAIN KEEP === */}
    <rect x="158" y="80" width="284" height="260" fill="#0d0a18" />
    {/* keep battlements — 14 merlons */}
    {[160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420].map((x, i) => (
      <rect key={i} x={x} y="64" width="14" height="18" fill="#0d0a18" />
    ))}
    {/* moon-light wash on keep */}
    <rect x="158" y="80" width="284" height="260" fill="url(#moonLight)" />

    {/* === LEFT INNER TOWER === */}
    <rect x="136" y="100" width="88" height="240" fill="#100d1e" />
    {[136, 151, 166, 181, 196, 210].map((x, i) => (
      <rect key={i} x={x} y="86" width="12" height="16" fill="#100d1e" />
    ))}
    {/* conical roof */}
    <polygon points="127,100 232,100 179,28" fill="#150a2c" />
    <polygon points="127,100 179,100 179,28" fill="rgba(180,155,255,0.07)" />
    {/* flag */}
    <line x1="179" y1="28" x2="179" y2="-4" stroke="#221838" strokeWidth="2" />
    <polygon points="179,-4 215,6 179,16" fill="#8b1a1a" />

    {/* === RIGHT INNER TOWER === */}
    <rect x="376" y="100" width="88" height="240" fill="#100d1e" />
    {[376, 391, 406, 421, 436, 450].map((x, i) => (
      <rect key={i} x={x} y="86" width="12" height="16" fill="#100d1e" />
    ))}
    <polygon points="368,100 472,100 420,28" fill="#150a2c" />
    <polygon points="420,100 472,100 420,28" fill="rgba(180,155,255,0.07)" />
    <line x1="420" y1="28" x2="420" y2="-4" stroke="#221838" strokeWidth="2" />
    <polygon points="420,-4 456,6 420,16" fill="#8b1a1a" />

    {/* === MAIN KEEP — WINDOWS === */}
    {/* Large central rose window */}
    <ellipse cx="300" cy="120" rx="20" ry="26" fill="#1c0f00" />
    <ellipse cx="300" cy="120" rx="14" ry="19" fill="#6b3d00" opacity="0.45" />
    {/* cross mullion */}
    <line x1="300" y1="95" x2="300" y2="145" stroke="#1c0f00" strokeWidth="2.5" />
    <line x1="280" y1="120" x2="320" y2="120" stroke="#1c0f00" strokeWidth="2.5" />
    {/* arrow slits */}
    <rect x="246" y="218" width="7" height="22" rx="3.5" fill="#07050f" />
    <rect x="347" y="218" width="7" height="22" rx="3.5" fill="#07050f" />

    {/* === GATEHOUSE === */}
    <rect x="254" y="194" width="92" height="146" fill="#09070f" />
    {/* gate arch void */}
    <rect x="270" y="230" width="60" height="110" fill="#05030a" />
    <ellipse cx="300" cy="230" rx="30" ry="21" fill="#05030a" />
    {/* portcullis vertical bars */}
    {[272, 282, 292, 302, 312, 322].map((x, i) => (
      <line key={i} x1={x} y1="212" x2={x} y2="340" stroke="#130f22" strokeWidth="2.5" />
    ))}
    {/* portcullis horizontal bars */}
    {[220, 234, 248, 262, 276, 290, 304].map((y, i) => (
      <line key={i} x1="267" y1={y} x2="333" y2={y} stroke="#130f22" strokeWidth="2" />
    ))}
    {/* gatehouse battlements */}
    {[254, 265, 276, 287, 298, 309, 320, 331].map((x, i) => (
      <rect key={i} x={x} y="182" width="9" height="14" fill="#09070f" />
    ))}
    {/* gatehouse side arrow slits */}
    <rect x="257" y="208" width="7" height="18" rx="3.5" fill="#06040c" />
    <rect x="336" y="208" width="7" height="18" rx="3.5" fill="#06040c" />

    {/* === CENTRAL FLAG (main keep top) === */}
    <line x1="300" y1="64" x2="300" y2="26" stroke="#221838" strokeWidth="3" />
    <polygon points="300,26 342,37 300,48" fill="#8b1a1a" />
  </svg>
);

// ── Bat SVG ──────────────────────────────────────────────────────────────────────────
const BatSVG: React.FC = () => (
  <svg viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg" width="32" height="16">
    <path d="M20,10 Q12,2 2,6 Q8,10 10,14 Q14,8 20,10 Q26,8 30,14 Q32,10 38,6 Q28,2 20,10Z" fill="#1a1030" />
    <circle cx="20" cy="10" r="3" fill="#1a1030" />
  </svg>
);
