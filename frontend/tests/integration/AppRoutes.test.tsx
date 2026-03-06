import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";

import App from "../../src/App";
import { AuthProvider } from "../../src/context/AuthContext";

const renderWithRouter = (initialEntries: string[]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe("AppRoutes (integración)", () => {
  it("debe mostrar la pantalla de login para ruta raíz /", () => {
    // Arrange
    const initialRoute = ["/"];

    // Act
    renderWithRouter(initialRoute);

    // Assert
    expect(
      screen.getByRole("heading", { name: /iniciar sesión/i })
    ).toBeInTheDocument();
  });

  it("debe mostrar página 404 para ruta inexistente (caso límite)", () => {
    // Arrange
    const initialRoute = ["/ruta/que/no/existe"];

    // Act
    renderWithRouter(initialRoute);

    // Assert
    expect(
      screen.getByText(/página no encontrada/i)
    ).toBeInTheDocument();
  });
});

