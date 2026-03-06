import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/Button";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const roles = user?.roles ?? [];

  return (
    <div>
      <header className="card" style={{ marginBottom: 16 }}>
        <div className="container" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <strong>Universidad Digital</strong>
          <span>{user?.full_name}</span>
          <span>{roles.join(", ")}</span>
          <div style={{ marginLeft: "auto" }}>
            <Button variant="secondary" onClick={() => void logout()}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
        <nav aria-label="Menú principal" className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">Menú</div>
            <div className="sidebar-subtitle">Panel</div>
          </div>
          <ul className="sidebar-list">
            {roles.includes("Administrador") && (
              <>
                <li>
                  <NavLink to="/admin" className="sidebar-link">
                    Panel admin
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/users" className="sidebar-link">
                    Usuarios
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/subjects" className="sidebar-link">
                    Materias
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/periods" className="sidebar-link">
                    Periodos
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/enrollments" className="sidebar-link">
                    Inscripciones
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/grades" className="sidebar-link">
                    Calificaciones
                  </NavLink>
                </li>
              </>
            )}
            {roles.includes("Docente") && (
              <>
                <li>
                  <NavLink to="/teacher" className="sidebar-link">
                    Panel docente
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/teacher/grades" className="sidebar-link">
                    Calificaciones
                  </NavLink>
                </li>
              </>
            )}
            {roles.includes("Estudiante") && (
              <>
                <li>
                  <NavLink to="/student" className="sidebar-link">
                    Panel estudiante
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/student/subjects" className="sidebar-link">
                    Materias
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/student/enrollments" className="sidebar-link">
                    Inscripciones
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/student/grades" className="sidebar-link">
                    Calificaciones
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
