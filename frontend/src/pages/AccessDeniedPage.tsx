import { Link } from "react-router-dom";

export function AccessDeniedPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--bg-app)",
        textAlign: "center",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: 120, height: 120 }}
          aria-hidden="true"
        >
          <circle cx="60" cy="60" r="58" fill="#ede9fe" stroke="#c4b5fd" strokeWidth="2" />
          <rect x="38" y="52" width="44" height="34" rx="6" fill="#6366f1" />
          <rect x="44" y="52" width="32" height="16" rx="4" fill="none" stroke="#4338ca" strokeWidth="2" />
          <path d="M48 52 C48 40 72 40 72 52" stroke="#4338ca" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="60" cy="68" r="5" fill="white" />
          <rect x="58" y="70" width="4" height="8" rx="2" fill="white" />
        </svg>
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--color-primary)", margin: "0 0 8px 0" }}>
        Acceso Denegado
      </h1>
      <p style={{ color: "var(--text-secondary)", maxWidth: 360, margin: "0 0 28px 0" }}>
        No tienes permisos para acceder a esta sección. Contacta al administrador si crees que esto es un error.
      </p>
      <Link
        to="/"
        className="button"
        style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}
      >
        🏠 Volver al inicio
      </Link>
    </main>
  );
}
