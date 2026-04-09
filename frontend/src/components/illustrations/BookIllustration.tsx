import type { CSSProperties } from "react";

interface Props {
  className?: string;
  style?: CSSProperties;
}

export function BookIllustration({ className, style }: Props) {
  return (
    <svg
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: 180, height: 160, ...style }}
      aria-hidden="true"
    >
      {/* Book shadow */}
      <ellipse cx="100" cy="165" rx="65" ry="8" fill="#c7d2fe" opacity="0.5" />
      {/* Left page */}
      <path d="M30 40 Q30 20 100 30 L100 150 Q30 140 30 160 Z" fill="#e0e7ff" />
      {/* Right page */}
      <path d="M170 40 Q170 20 100 30 L100 150 Q170 140 170 160 Z" fill="#c7d2fe" />
      {/* Spine */}
      <rect x="96" y="30" width="8" height="120" rx="2" fill="#6366f1" />
      {/* Left page lines */}
      <line x1="50" y1="65" x2="90" y2="62" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="75" x2="90" y2="72" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="85" x2="90" y2="82" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="95" x2="90" y2="92" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="105" x2="90" y2="102" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" />
      {/* Right page lines */}
      <line x1="110" y1="62" x2="150" y2="65" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
      <line x1="110" y1="72" x2="150" y2="75" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
      <line x1="110" y1="82" x2="150" y2="85" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
      <line x1="110" y1="92" x2="150" y2="95" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
      {/* Sparkles */}
      <text x="15" y="45" fontSize="18" fill="#f59e0b">✦</text>
      <text x="170" y="35" fontSize="14" fill="#6366f1">✦</text>
      <text x="160" y="130" fontSize="12" fill="#10b981">✦</text>
    </svg>
  );
}
