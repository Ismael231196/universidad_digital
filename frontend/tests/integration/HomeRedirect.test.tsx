import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

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

function renderWithAuth(ctxOverride: Partial<typeof baseContext>) {
  const value = { ...baseContext, ...ctxOverride };

  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
        <Routes>
          <Route path="/admin" element={<div>Admin dashboard</div>} />
          <Route path="/teacher" element={<div>Teacher dashboard</div>} />
          <Route path="/student" element={<div>Student dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("AppRoutes HomeRedirect (integración)", () => {
  it("redirige a /login si no hay usuario", () => {
    // Arrange & Act
    renderWithAuth({ user: null });

    // Assert
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
  });

  it("redirige a /admin si el usuario es Administrador", () => {
    // Arrange & Act
    renderWithAuth({
      user: {
        id: 1,
        full_name: "Admin",
        email: "admin@example.com",
        roles: ["Administrador"]
      },
      isAuthenticated: true,
      hasRole: (roles) => roles.includes("Administrador")
    });

    // Assert
    expect(screen.getByText(/panel administrador/i)).toBeInTheDocument();
  });

  it("redirige a /teacher si el usuario es Docente", () => {
    renderWithAuth({
      user: {
        id: 2,
        full_name: "Teacher",
        email: "t@example.com",
        roles: ["Docente"]
      },
      isAuthenticated: true,
      hasRole: (roles) => roles.includes("Docente")
    });

    expect(screen.getByRole("heading", { name: /panel docente/i })).toBeInTheDocument();
  });

  it("redirige a /student en cualquier otro caso", () => {
    renderWithAuth({
      user: {
        id: 3,
        full_name: "Student",
        email: "s@example.com",
        roles: ["Estudiante"]
      },
      isAuthenticated: true,
      hasRole: (roles) => roles.includes("Estudiante")
    });

    expect(screen.getByRole("heading", { name: /panel estudiante/i })).toBeInTheDocument();
  });
});

