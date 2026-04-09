import { useState } from "react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/Button";
import { Avatar } from "../components/Avatar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const roles = user?.roles ?? [];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="header">
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Abrir menú"
          type="button"
        >
          ☰
        </button>
        <div className="header-brand">
          <span>🎓</span>
          <span>Universidad Digital</span>
        </div>
        <div className="header-spacer" />
        <div className="header-user">
          {user && (
            <>
              <Avatar name={user.full_name} role={roles[0] ?? ""} size="md" />
              <span className="header-user-name">{user.full_name}</span>
            </>
          )}
          <Button variant="secondary" onClick={() => void logout()}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      {/* Sidebar overlay (mobile) */}
      <div
        className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`} aria-label="Navegación principal">
        <div className="sidebar-brand">
          <div className="sidebar-brand-title">🎓 Universidad Digital</div>
          <div className="sidebar-brand-sub">Portal Académico</div>
        </div>
        <nav className="sidebar-nav" aria-label="Menú principal">
          <ul className="sidebar-list">
            {roles.includes("Administrador") && (
              <>
                <li>
                  <NavLink to="/admin" end className="sidebar-link" onClick={closeSidebar}>
                    🏛️ Panel Admin
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/users" className="sidebar-link" onClick={closeSidebar}>
                    👥 Usuarios
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/subjects" className="sidebar-link" onClick={closeSidebar}>
                    📚 Materias
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/periods" className="sidebar-link" onClick={closeSidebar}>
                    📅 Periodos
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/enrollments" className="sidebar-link" onClick={closeSidebar}>
                    📋 Inscripciones
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/grades" className="sidebar-link" onClick={closeSidebar}>
                    📊 Calificaciones
                  </NavLink>
                </li>
              </>
            )}
            {roles.includes("Docente") && (
              <>
                <li>
                  <NavLink to="/teacher" end className="sidebar-link" onClick={closeSidebar}>
                    🎓 Panel Docente
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/teacher/grades" className="sidebar-link" onClick={closeSidebar}>
                    📊 Calificaciones
                  </NavLink>
                </li>
              </>
            )}
            {roles.includes("Estudiante") && (
              <>
                <li>
                  <NavLink to="/student" end className="sidebar-link" onClick={closeSidebar}>
                    🎒 Panel Estudiante
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/student/subjects" className="sidebar-link" onClick={closeSidebar}>
                    📚 Materias
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/student/enrollments" className="sidebar-link" onClick={closeSidebar}>
                    📋 Inscripciones
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/student/grades" className="sidebar-link" onClick={closeSidebar}>
                    📊 Calificaciones
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
        {user && (
          <div className="sidebar-footer">
            <div className="sidebar-role">Rol activo</div>
            {roles.map((role) => (
              <span
                key={role}
                className={`role-badge role-${
                  role === "Administrador"
                    ? "admin"
                    : role === "Docente"
                    ? "teacher"
                    : "student"
                }`}
                style={{ marginRight: 4 }}
              >
                {role}
              </span>
            ))}
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="main-content">{children}</main>
    </div>
  );
}
