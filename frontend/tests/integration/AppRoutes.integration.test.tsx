import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../../src/routes/AppRoutes";
import { AuthContext } from "../../src/context/AuthContext";

const baseContext = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  login: async () => false,
  logout: async () => {},
  refreshUser: async () => {},
  hasRole: () => false
};

function renderAt(path: string, ctxOverride: Partial<typeof baseContext> = {}) {
  const value = { ...baseContext, ...ctxOverride };
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("AppRoutes integration", () => {
  it("muestra estado de carga en / mientras valida sesión", () => {
    renderAt("/", { isLoading: true });
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it("muestra login en /login", () => {
    renderAt("/login");
    expect(screen.getByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it("redirige a panel docente en / cuando el rol es Docente", () => {
    renderAt("/", {
      user: {
        id: 3,
        email: "teacher@example.com",
        full_name: "Teacher",
        is_active: true,
        created_at: new Date().toISOString(),
        roles: ["Docente"]
      },
      isAuthenticated: true,
      hasRole: (roles) => roles.includes("Docente")
    });

    expect(screen.getByRole("heading", { name: /panel docente/i })).toBeInTheDocument();
  });

  it("redirige a panel estudiante en / cuando el rol es Estudiante", () => {
    renderAt("/", {
      user: {
        id: 4,
        email: "student@example.com",
        full_name: "Student",
        is_active: true,
        created_at: new Date().toISOString(),
        roles: ["Estudiante"]
      },
      isAuthenticated: true,
      hasRole: (roles) => roles.includes("Estudiante")
    });

    expect(screen.getByRole("heading", { name: /panel estudiante/i })).toBeInTheDocument();
  });

  it("redirige a /denied cuando un estudiante entra a /admin", () => {
    renderAt("/admin", {
      user: {
        id: 1,
        email: "student@example.com",
        full_name: "Student",
        is_active: true,
        created_at: new Date().toISOString(),
        roles: ["Estudiante"]
      },
      isAuthenticated: true,
      hasRole: (roles) => roles.includes("Estudiante")
    });

    expect(screen.getByRole("heading", { name: /acceso denegado/i })).toBeInTheDocument();
  });

  it("permite /admin a un administrador", () => {
    renderAt("/admin", {
      user: {
        id: 2,
        email: "admin@example.com",
        full_name: "Admin",
        is_active: true,
        created_at: new Date().toISOString(),
        roles: ["Administrador"]
      },
      isAuthenticated: true,
      hasRole: (roles) => roles.includes("Administrador")
    });

    expect(screen.getByRole("heading", { name: /panel administrador/i })).toBeInTheDocument();
  });

  it("redirige a /login cuando no hay sesión y se entra a /teacher", () => {
    renderAt("/teacher", {
      user: null,
      isAuthenticated: false
    });

    expect(screen.getByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it("bloquea /teacher/grades para rol Estudiante", () => {
    renderAt("/teacher/grades", {
      user: {
        id: 5,
        email: "student2@example.com",
        full_name: "Student 2",
        is_active: true,
        created_at: new Date().toISOString(),
        roles: ["Estudiante"]
      },
      isAuthenticated: true,
      hasRole: (roles) => roles.includes("Estudiante")
    });

    expect(screen.getByRole("heading", { name: /acceso denegado/i })).toBeInTheDocument();
  });

  it("permite /teacher/grades para rol Docente", () => {
    renderAt("/teacher/grades", {
      user: {
        id: 6,
        email: "teacher2@example.com",
        full_name: "Teacher 2",
        is_active: true,
        created_at: new Date().toISOString(),
        roles: ["Docente"]
      },
      isAuthenticated: true,
      hasRole: (roles) => roles.includes("Docente")
    });

    expect(screen.getByRole("heading", { name: /registrar calificación/i })).toBeInTheDocument();
  });

  it("muestra 404 para ruta inexistente", () => {
    renderAt("/ruta-inexistente");
    expect(screen.getByText(/la página solicitada no existe/i)).toBeInTheDocument();
  });
});
