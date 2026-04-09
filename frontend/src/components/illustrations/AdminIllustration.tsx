import type { CSSProperties } from "react";

interface Props {
  className?: string;
  style?: CSSProperties;
}

export function AdminIllustration({ className, style }: Props) {
  return (
    <svg
      viewBox="0 0 300 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: 260, height: 220, ...style }}
      aria-hidden="true"
    >
      {/* Monitor */}
      <rect x="60" y="40" width="160" height="110" rx="8" fill="#1e1b4b" />
      <rect x="65" y="45" width="150" height="100" rx="6" fill="#312e81" />
      {/* Screen content - dashboard */}
      <rect x="70" y="50" width="140" height="20" rx="3" fill="#4338ca" />
      <rect x="75" y="55" width="60" height="8" rx="2" fill="#a5b4fc" />
      {/* Stat cards on screen */}
      <rect x="70" y="76" width="30" height="28" rx="3" fill="#6366f1" />
      <rect x="73" y="79" width="14" height="4" rx="2" fill="#c7d2fe" />
      <rect x="73" y="86" width="20" height="6" rx="2" fill="#e0e7ff" />
      <rect x="106" y="76" width="30" height="28" rx="3" fill="#10b981" />
      <rect x="109" y="79" width="14" height="4" rx="2" fill="#a7f3d0" />
      <rect x="109" y="86" width="20" height="6" rx="2" fill="#d1fae5" />
      <rect x="142" y="76" width="30" height="28" rx="3" fill="#f59e0b" />
      <rect x="145" y="79" width="14" height="4" rx="2" fill="#fde68a" />
      <rect x="145" y="86" width="20" height="6" rx="2" fill="#fef3c7" />
      <rect x="178" y="76" width="27" height="28" rx="3" fill="#ef4444" />
      <rect x="181" y="79" width="14" height="4" rx="2" fill="#fecaca" />
      <rect x="181" y="86" width="18" height="6" rx="2" fill="#fee2e2" />
      {/* Chart line on screen */}
      <polyline points="70,125 90,118 110,122 130,110 150,115 170,105 190,108 205,100" stroke="#818cf8" strokeWidth="2" fill="none" />
      {/* Monitor stand */}
      <rect x="125" y="150" width="30" height="8" rx="2" fill="#3730a3" />
      <rect x="105" y="158" width="70" height="6" rx="3" fill="#4338ca" />
      {/* Person */}
      <circle cx="240" cy="110" r="22" fill="#fde68a" />
      {/* Face */}
      <circle cx="233" cy="108" r="2.5" fill="#1e1b4b" />
      <circle cx="247" cy="108" r="2.5" fill="#1e1b4b" />
      <path d="M233 117 Q240 122 247 117" stroke="#1e1b4b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Hair */}
      <path d="M218 106 Q222 88 240 86 Q258 84 262 106" fill="#1e1b4b" />
      {/* Body */}
      <rect x="220" y="130" width="40" height="45" rx="8" fill="#4f46e5" />
      {/* Collar */}
      <polygon points="240,131 236,145 240,148 244,145" fill="#3730a3" />
      {/* Arms */}
      <rect x="200" y="132" width="22" height="10" rx="5" fill="#4f46e5" transform="rotate(10, 200, 132)" />
      <rect x="260" y="130" width="20" height="10" rx="5" fill="#4f46e5" transform="rotate(-10, 260, 130)" />
      {/* Clipboard in hand */}
      <rect x="205" y="140" width="18" height="22" rx="2" fill="#e0e7ff" />
      <rect x="211" y="136" width="6" height="6" rx="2" fill="#6366f1" />
      <rect x="208" y="147" width="12" height="2" rx="1" fill="#a5b4fc" />
      <rect x="208" y="152" width="10" height="2" rx="1" fill="#a5b4fc" />
      <rect x="208" y="157" width="11" height="2" rx="1" fill="#a5b4fc" />
      {/* Floor */}
      <rect x="30" y="218" width="240" height="6" rx="3" fill="#e0e7ff" />
    </svg>
  );
}
