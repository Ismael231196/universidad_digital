import { Link } from "react-router-dom";
import { NotFoundIllustration } from "../components/illustrations/NotFoundIllustration";

export function NotFoundPage() {
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
      <div className="illustration-container" style={{ marginBottom: 16 }}>
        <NotFoundIllustration />
      </div>
      <h1
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: "var(--color-primary)",
          margin: "0 0 8px 0",
          lineHeight: 1,
        }}
      >
        404
      </h1>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 12px 0", color: "var(--text-primary)" }}>
        Página no encontrada
      </h2>
      <p style={{ color: "var(--text-secondary)", maxWidth: 380, margin: "0 0 28px 0" }}>
        La página que buscas no existe o fue movida. Verifica la dirección o vuelve al inicio.
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
