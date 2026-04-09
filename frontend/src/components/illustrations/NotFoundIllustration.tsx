import type { CSSProperties } from "react";

interface Props {
  className?: string;
  style?: CSSProperties;
}

export function NotFoundIllustration({ className, style }: Props) {
  return (
    <svg
      viewBox="0 0 300 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: 280, height: 240, ...style }}
      aria-hidden="true"
    >
      {/* Ground */}
      <ellipse cx="150" cy="235" rx="100" ry="12" fill="#c7d2fe" opacity="0.5" />
      {/* Big question mark */}
      <text x="180" y="160" fontSize="110" fill="#e0e7ff" fontWeight="bold">?</text>
      <text x="185" y="158" fontSize="106" fill="#c7d2fe" fontWeight="bold">?</text>
      {/* Person looking confused */}
      {/* Body */}
      <rect x="70" y="145" width="40" height="55" rx="8" fill="#6366f1" />
      {/* Head */}
      <circle cx="90" cy="125" r="24" fill="#fde68a" />
      {/* Hair */}
      <path d="M66 120 Q70 100 90 98 Q110 96 114 120" fill="#1e1b4b" />
      {/* Confused face */}
      <circle cx="83" cy="122" r="3" fill="#1e1b4b" />
      <circle cx="97" cy="122" r="3" fill="#1e1b4b" />
      {/* Wavy mouth (confused) */}
      <path d="M82 133 Q86 130 90 133 Q94 136 98 133" stroke="#1e1b4b" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Raised eyebrow */}
      <path d="M80 116 Q83 113 86 116" stroke="#1e1b4b" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M94 116 Q97 113 100 116" stroke="#1e1b4b" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Arms - one pointing at question mark */}
      <rect x="108" y="148" width="30" height="11" rx="5" fill="#6366f1" transform="rotate(-20, 108, 148)" />
      <rect x="42" y="148" width="30" height="11" rx="5" fill="#6366f1" transform="rotate(20, 42, 148)" />
      {/* Map in hand */}
      <rect x="13" y="162" width="32" height="26" rx="3" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1.5" />
      <line x1="18" y1="172" x2="40" y2="172" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="18" y1="178" x2="35" y2="178" stroke="#f59e0b" strokeWidth="1.5" />
      <circle cx="28" cy="167" r="3" fill="#ef4444" />
      {/* Legs */}
      <rect x="76" y="198" width="14" height="30" rx="5" fill="#4338ca" />
      <rect x="94" y="198" width="14" height="30" rx="5" fill="#4338ca" />
      {/* Shoes */}
      <rect x="72" y="224" width="20" height="8" rx="4" fill="#1e1b4b" />
      <rect x="90" y="224" width="20" height="8" rx="4" fill="#1e1b4b" />
    </svg>
  );
}
