import { MemoryRouter } from "react-router-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { LoginPage } from "../../src/pages/LoginPage";
import { AuthContext } from "../../src/context/AuthContext";

const baseContext = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null as string | null,
  login: vi.fn(),
  logout: async () => {},
  refreshUser: async () => {},
  hasRole: () => false
};

function renderWithAuth(ctxOverride: Partial<typeof baseContext> = {}) {
  const value = { ...baseContext, ...ctxOverride };

  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={["/login"]}>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("LoginPage (integración formulario + Auth)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("muestra errores de validación de zod para email y password inválidos (casos inválidos)", async () => {
    // Arrange
    renderWithAuth();

    const submitButton = screen.getByRole("button", { name: /entrar/i });

    // Act
    fireEvent.click(submitButton);

    // Assert
    expect(
      await screen.findByText(/ingresa un email válido/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/al menos 8 caracteres/i)
    ).toBeInTheDocument();
  });

  it("llama a login con datos saneados al enviar formulario (caso normal + seguridad XSS)", async () => {
    // Arrange
    const loginMock = vi.fn().mockResolvedValue(true);
    renderWithAuth({ login: loginMock });

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    // Act
    fireEvent.change(emailInput, { target: { value: "  admin@example.com  " } });
    fireEvent.change(passwordInput, { target: { value: "  Passw0rd!  " } });
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("admin@example.com", "Passw0rd!");
    });
  });

  it("muestra mensaje de error cuando el contexto expone un error de autenticación", () => {
    // Arrange & Act
    renderWithAuth({ error: "Credenciales inválidas" });

    // Assert
    expect(screen.getByRole("alert")).toHaveTextContent("Credenciales inválidas");
  });
});

