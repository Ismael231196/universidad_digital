import type { CSSProperties } from "react";

interface Props {
  className?: string;
  style?: CSSProperties;
}

export function TeacherIllustration({ className, style }: Props) {
  return (
    <svg
      viewBox="0 0 300 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: 260, height: 220, ...style }}
      aria-hidden="true"
    >
      {/* Whiteboard */}
      <rect x="30" y="30" width="200" height="130" rx="8" fill="#f0f4ff" stroke="#c7d2fe" strokeWidth="2" />
      <rect x="30" y="30" width="200" height="10" rx="8" fill="#6366f1" />
      {/* Board content */}
      <rect x="50" y="55" width="80" height="6" rx="3" fill="#c7d2fe" />
      <rect x="50" y="68" width="60" height="4" rx="2" fill="#ddd6fe" />
      <rect x="50" y="78" width="70" height="4" rx="2" fill="#ddd6fe" />
      {/* Chart bars on board */}
      <rect x="160" y="120" width="14" height="28" rx="2" fill="#818cf8" />
      <rect x="180" y="105" width="14" height="43" rx="2" fill="#6366f1" />
      <rect x="200" y="112" width="14" height="36" rx="2" fill="#4338ca" />
      {/* Board bottom rail */}
      <rect x="30" y="152" width="200" height="8" rx="0" fill="#a5b4fc" />
      {/* Person */}
      {/* Body */}
      <rect x="112" y="170" width="36" height="50" rx="8" fill="#10b981" />
      {/* Tie */}
      <polygon points="130,172 126,195 130,200 134,195" fill="#065f46" />
      {/* Arms - one pointing at board */}
      <rect x="90" y="173" width="25" height="10" rx="5" fill="#10b981" transform="rotate(-25, 90, 173)" />
      <rect x="148" y="173" width="22" height="10" rx="5" fill="#10b981" />
      {/* Head */}
      <circle cx="130" cy="152" r="20" fill="#fde68a" />
      {/* Face */}
      <circle cx="124" cy="150" r="2.5" fill="#1e1b4b" />
      <circle cx="136" cy="150" r="2.5" fill="#1e1b4b" />
      <path d="M124 158 Q130 163 136 158" stroke="#1e1b4b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Glasses */}
      <circle cx="124" cy="150" r="6" fill="none" stroke="#6366f1" strokeWidth="1.5" />
      <circle cx="136" cy="150" r="6" fill="none" stroke="#6366f1" strokeWidth="1.5" />
      <line x1="130" y1="150" x2="130" y2="150" stroke="#6366f1" strokeWidth="1.5" />
      {/* Hair */}
      <path d="M110 148 Q115 132 130 130 Q145 128 150 148" fill="#1e1b4b" />
      {/* Marker in hand */}
      <rect x="77" y="153" width="16" height="5" rx="2" fill="#f59e0b" transform="rotate(-25, 77, 153)" />
      {/* Floor */}
      <rect x="30" y="218" width="240" height="6" rx="3" fill="#e0e7ff" />
    </svg>
  );
}
