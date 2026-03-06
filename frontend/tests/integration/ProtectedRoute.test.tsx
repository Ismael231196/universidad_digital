import { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { ProtectedRoute } from "../../src/routes/ProtectedRoute";
import { AuthContext } from "../../src/context/AuthContext";

type AuthContextValue = React.ContextType<typeof AuthContext>;

function renderWithAuth(ui: ReactNode, value: AuthContextValue) {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={["/protegida"]}>
        <Routes>
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/denied" element={<div>Acceso denegado</div>} />
          <Route path="/protegida" element={ui} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

const baseContext: AuthContextValue = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  login: async () => false,
  logout: async () => {},
  refreshUser: async () => {},
  hasRole: () => false
};

describe("ProtectedRoute (integración)", () => {
  it("debe mostrar loading mientras isLoading es true", () => {
    // Arrange
    const value = { ...baseContext, isLoading: true };

    // Act
    renderWithAuth(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>,
      value
    );

    // Assert
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it("debe redirigir a /login si no está autenticado", () => {
    // Arrange
    const value = { ...baseContext, isAuthenticated: false };

    // Act
    renderWithAuth(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>,
      value
    );

    // Assert
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("debe permitir acceso cuando está autenticado y sin roles específicos", () => {
    // Arrange
    const value = {
      ...baseContext,
      isAuthenticated: true,
      user: { id: 1, name: "User", email: "u@example.com", roles: [] }
    } as AuthContextValue;

    // Act
    renderWithAuth(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>,
      value
    );

    // Assert
    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });

  it("debe redirigir a /denied si no tiene el rol requerido (seguridad)", () => {
    // Arrange
    const value = {
      ...baseContext,
      isAuthenticated: true,
      user: { id: 1, name: "User", email: "u@example.com", roles: ["Estudiante"] },
      hasRole: () => false
    } as AuthContextValue;

    // Act
    renderWithAuth(
      <ProtectedRoute roles={["Administrador"]}>
        <div>Admin only</div>
      </ProtectedRoute>,
      value
    );

    // Assert
    expect(screen.getByText("Acceso denegado")).toBeInTheDocument();
  });
}

