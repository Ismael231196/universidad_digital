import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

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

describe("LoginPage integration", () => {
  it("renderiza formulario de login", () => {
    renderWithAuth();

    expect(screen.getByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("envía credenciales saneadas al contexto", async () => {
    const loginMock = vi.fn().mockResolvedValue(true);
    renderWithAuth({ login: loginMock });

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "  admin@example.com  " }
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "  Passw0rd123  " }
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("admin@example.com", "Passw0rd123");
    });
  });

  it("muestra error desde el contexto", () => {
    renderWithAuth({ error: "Credenciales inválidas" });
    expect(screen.getByRole("alert")).toHaveTextContent("Credenciales inválidas");
  });

  it("no envía el formulario si el email es inválido", async () => {
    const loginMock = vi.fn().mockResolvedValue(true);
    renderWithAuth({ login: loginMock });

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "correo-invalido" }
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "Passw0rd123" }
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    // El input tipo email puede bloquear el submit a nivel navegador,
    // por eso validamos la regla de negocio clave: no invocar login.
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("deshabilita el botón mientras isSubmitting está activo", async () => {
    let resolveLogin: ((ok: boolean) => void) | null = null;
    const loginMock = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveLogin = resolve;
        })
    );

    renderWithAuth({ login: loginMock });

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "admin@example.com" }
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "Passw0rd123" }
    });

    const submit = screen.getByRole("button", { name: /entrar/i });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(submit).toBeDisabled();
    });

    resolveLogin?.(true);

    await waitFor(() => {
      expect(submit).not.toBeDisabled();
    });
  });
});
