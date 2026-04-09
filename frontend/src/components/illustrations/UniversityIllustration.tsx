import type { CSSProperties } from "react";

interface Props {
  className?: string;
  style?: CSSProperties;
}

export function UniversityIllustration({ className, style }: Props) {
  return (
    <svg
      viewBox="0 0 300 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: 280, height: 240, ...style }}
      aria-hidden="true"
    >
      {/* Sky */}
      <rect x="0" y="0" width="300" height="260" rx="12" fill="#eef2ff" />
      {/* Clouds */}
      <circle cx="50" cy="40" r="16" fill="white" opacity="0.8" />
      <circle cx="68" cy="34" r="20" fill="white" opacity="0.8" />
      <circle cx="88" cy="40" r="15" fill="white" opacity="0.8" />
      <circle cx="220" cy="50" r="14" fill="white" opacity="0.7" />
      <circle cx="238" cy="44" r="18" fill="white" opacity="0.7" />
      <circle cx="255" cy="50" r="13" fill="white" opacity="0.7" />
      {/* Ground */}
      <rect x="0" y="215" width="300" height="45" rx="0" fill="#a5b4fc" />
      <rect x="0" y="215" width="300" height="8" rx="0" fill="#818cf8" />
      {/* Path */}
      <rect x="120" y="215" width="60" height="45" rx="0" fill="#c7d2fe" />
      {/* Main building */}
      <rect x="60" y="110" width="180" height="110" rx="4" fill="#4338ca" />
      <rect x="60" y="110" width="180" height="110" rx="4" fill="url(#buildingGrad)" />
      <defs>
        <linearGradient id="buildingGrad" x1="60" y1="110" x2="240" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3730a3" />
        </linearGradient>
      </defs>
      {/* Columns */}
      <rect x="80" y="145" width="10" height="75" rx="2" fill="#4338ca" />
      <rect x="105" y="145" width="10" height="75" rx="2" fill="#4338ca" />
      <rect x="185" y="145" width="10" height="75" rx="2" fill="#4338ca" />
      <rect x="210" y="145" width="10" height="75" rx="2" fill="#4338ca" />
      {/* Pediment / Triangle roof */}
      <polygon points="55,112 150,60 245,112" fill="#4f46e5" />
      <polygon points="65,112 150,66 235,112" fill="#6366f1" />
      {/* Door */}
      <rect x="133" y="175" width="34" height="45" rx="4" fill="#1e1b4b" />
      <rect x="136" y="178" width="28" height="38" rx="3" fill="#312e81" />
      <circle cx="163" cy="198" r="2.5" fill="#fbbf24" />
      {/* Windows */}
      <rect x="75" y="120" width="22" height="20" rx="2" fill="#a5b4fc" />
      <rect x="109" y="120" width="22" height="20" rx="2" fill="#a5b4fc" />
      <rect x="169" y="120" width="22" height="20" rx="2" fill="#a5b4fc" />
      <rect x="203" y="120" width="22" height="20" rx="2" fill="#a5b4fc" />
      {/* Cross lines on windows */}
      <line x1="86" y1="120" x2="86" y2="140" stroke="#6366f1" strokeWidth="1" />
      <line x1="75" y1="130" x2="97" y2="130" stroke="#6366f1" strokeWidth="1" />
      <line x1="120" y1="120" x2="120" y2="140" stroke="#6366f1" strokeWidth="1" />
      <line x1="109" y1="130" x2="131" y2="130" stroke="#6366f1" strokeWidth="1" />
      <line x1="180" y1="120" x2="180" y2="140" stroke="#6366f1" strokeWidth="1" />
      <line x1="169" y1="130" x2="191" y2="130" stroke="#6366f1" strokeWidth="1" />
      <line x1="214" y1="120" x2="214" y2="140" stroke="#6366f1" strokeWidth="1" />
      <line x1="203" y1="130" x2="225" y2="130" stroke="#6366f1" strokeWidth="1" />
      {/* Flag pole */}
      <line x1="150" y1="20" x2="150" y2="65" stroke="#e0e7ff" strokeWidth="2" />
      <rect x="150" y="20" width="22" height="16" rx="1" fill="#f59e0b" />
      {/* Graduation cap on top of building (decoration) */}
      <ellipse cx="150" cy="73" rx="22" ry="6" fill="#1e1b4b" />
      <rect x="139" y="66" width="22" height="8" rx="2" fill="#0f172a" />
      {/* Trees */}
      <rect x="20" y="185" width="8" height="30" rx="2" fill="#059669" />
      <ellipse cx="24" cy="178" rx="16" ry="18" fill="#10b981" />
      <rect x="272" y="185" width="8" height="30" rx="2" fill="#059669" />
      <ellipse cx="276" cy="178" rx="16" ry="18" fill="#10b981" />
    </svg>
  );
}
