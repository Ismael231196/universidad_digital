import type { CSSProperties } from "react";

interface Props {
  className?: string;
  style?: CSSProperties;
}

export function GradesIllustration({ className, style }: Props) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: 180, height: 180, ...style }}
      aria-hidden="true"
    >
      {/* Certificate */}
      <rect x="25" y="30" width="150" height="110" rx="8" fill="#fef3c7" stroke="#fde68a" strokeWidth="2" />
      {/* Top banner */}
      <rect x="25" y="30" width="150" height="22" rx="8" fill="#f59e0b" />
      <rect x="25" y="44" width="150" height="8" rx="0" fill="#f59e0b" />
      {/* Certificate text lines */}
      <rect x="60" y="66" width="80" height="6" rx="3" fill="#fde68a" />
      <rect x="50" y="78" width="100" height="4" rx="2" fill="#fcd34d" />
      <rect x="55" y="88" width="90" height="4" rx="2" fill="#fcd34d" />
      {/* Star */}
      <text x="82" y="130" fontSize="28" fill="#f59e0b">★</text>
      {/* Ribbon left */}
      <rect x="55" y="140" width="18" height="40" rx="2" fill="#6366f1" />
      <polygon points="55,180 73,180 73,190 64,184 55,190" fill="#4338ca" />
      {/* Ribbon right */}
      <rect x="127" y="140" width="18" height="40" rx="2" fill="#6366f1" />
      <polygon points="127,180 145,180 145,190 136,184 127,190" fill="#4338ca" />
      {/* Seal */}
      <circle cx="100" cy="152" r="18" fill="#f59e0b" />
      <circle cx="100" cy="152" r="13" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="91" y="157" fontSize="14" fill="#78350f">★</text>
      {/* Sparkles */}
      <text x="15" y="50" fontSize="16" fill="#6366f1">✦</text>
      <text x="170" y="45" fontSize="12" fill="#10b981">✦</text>
    </svg>
  );
}
