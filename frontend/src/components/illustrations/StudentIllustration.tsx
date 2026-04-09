import type { CSSProperties } from "react";

interface Props {
  className?: string;
  style?: CSSProperties;
}

export function StudentIllustration({ className, style }: Props) {
  return (
    <svg
      viewBox="0 0 300 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: 260, height: 220, ...style }}
      aria-hidden="true"
    >
      {/* Desk */}
      <rect x="40" y="180" width="220" height="12" rx="4" fill="#c7d2fe" />
      <rect x="60" y="192" width="12" height="40" rx="3" fill="#a5b4fc" />
      <rect x="228" y="192" width="12" height="40" rx="3" fill="#a5b4fc" />
      {/* Book on desk */}
      <rect x="80" y="150" width="55" height="32" rx="4" fill="#6366f1" />
      <rect x="82" y="152" width="51" height="28" rx="3" fill="#818cf8" />
      <line x1="107" y1="152" x2="107" y2="180" stroke="#6366f1" strokeWidth="1.5" />
      <rect x="95" y="158" width="24" height="3" rx="1.5" fill="#e0e7ff" />
      <rect x="95" y="164" width="18" height="3" rx="1.5" fill="#e0e7ff" />
      <rect x="95" y="170" width="20" height="3" rx="1.5" fill="#e0e7ff" />
      {/* Laptop */}
      <rect x="145" y="148" width="80" height="48" rx="4" fill="#1e1b4b" />
      <rect x="148" y="151" width="74" height="42" rx="3" fill="#312e81" />
      <rect x="152" y="155" width="66" height="34" rx="2" fill="#4338ca" />
      {/* Screen content */}
      <rect x="158" y="160" width="30" height="4" rx="2" fill="#a5b4fc" />
      <rect x="158" y="167" width="50" height="3" rx="1.5" fill="#818cf8" />
      <rect x="158" y="173" width="40" height="3" rx="1.5" fill="#818cf8" />
      <rect x="135" y="196" width="100" height="6" rx="3" fill="#3730a3" />
      {/* Person body */}
      <rect x="148" y="100" width="30" height="45" rx="8" fill="#fbbf24" />
      {/* Arms */}
      <rect x="133" y="105" width="18" height="10" rx="5" fill="#fbbf24" transform="rotate(20, 133, 105)" />
      <rect x="178" y="100" width="18" height="10" rx="5" fill="#fbbf24" transform="rotate(-15, 178, 100)" />
      {/* Head */}
      <circle cx="163" cy="82" r="22" fill="#fde68a" />
      {/* Face */}
      <circle cx="156" cy="80" r="3" fill="#1e1b4b" />
      <circle cx="170" cy="80" r="3" fill="#1e1b4b" />
      <path d="M156 90 Q163 96 170 90" stroke="#1e1b4b" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Graduation cap */}
      <ellipse cx="163" cy="62" rx="26" ry="7" fill="#4338ca" />
      <rect x="150" y="55" width="26" height="8" rx="2" fill="#3730a3" />
      <line x1="189" y1="62" x2="189" y2="74" stroke="#6366f1" strokeWidth="2" />
      <circle cx="189" cy="76" r="4" fill="#f59e0b" />
      {/* Sparkles */}
      <text x="50" y="70" fontSize="16" fill="#f59e0b">✦</text>
      <text x="245" y="100" fontSize="12" fill="#6366f1">✦</text>
      <text x="235" y="60" fontSize="10" fill="#10b981">✦</text>
    </svg>
  );
}
