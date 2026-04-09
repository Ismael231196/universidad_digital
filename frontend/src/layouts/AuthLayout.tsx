import type { ReactNode } from "react";
import { UniversityIllustration } from "../components/illustrations/UniversityIllustration";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="login-page">
      <div className="login-left">
        <UniversityIllustration style={{ width: 280, height: 230 }} />
        <div className="login-left-content">
          <h2 className="login-left-title">Universidad Digital</h2>
          <p className="login-left-tagline">
            Plataforma académica para estudiantes, docentes y administradores
          </p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-container">{children}</div>
      </div>
    </div>
  );
}
