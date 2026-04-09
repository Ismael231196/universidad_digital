import type { CSSProperties } from "react";

interface Props {
  name: string;
  role: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: CSSProperties;
}

const roleColors: Record<string, string> = {
  Administrador: "#4f46e5",
  Docente: "#10b981",
  Estudiante: "#f59e0b",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ name, role, size = "md", className, style }: Props) {
  const color = roleColors[role] ?? "#64748b";
  const initials = getInitials(name);
  return (
    <div
      className={`avatar avatar-${size}${className ? ` ${className}` : ""}`}
      style={{ backgroundColor: color, ...style }}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
