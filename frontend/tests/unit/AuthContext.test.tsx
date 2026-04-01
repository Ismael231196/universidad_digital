import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { AuthProvider, AuthContext } from "../../src/context/AuthContext";
import { useAuth } from "../../src/hooks/useAuth";

vi.mock("../../src/services/authService", () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn()
}));

vi.mock("../../src/api/http", () => ({
  setUnauthorizedHandler: vi.fn()
}));

vi.mock("../../src/utils/apiError", () => ({
  getErrorMessage: (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback,
  isUnauthorized: (err: unknown) => (err as { status?: number })?.status === 401
}));

const mockAuthService = await import("../../src/services/authService");

describe("AuthContext / useAuth", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("debe lanzar error si useAuth se usa fuera de AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrowError(
      "useAuth debe usarse dentro de AuthProvider"
    );
  });

  it("debe establecer usuario tras login exitoso", async () => {
    // Arrange
    (mockAuthService.login as unknown as vi.Mock).mockResolvedValue(undefined);
    (mockAuthService.getCurrentUser as unknown as vi.Mock).mockResolvedValue({
      id: 1,
      full_name: "Admin",
      email: "admin@example.com",
      roles: ["Administrador"]
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Act
    await act(async () => {
      const ok = await result.current.login("admin@example.com", "password");
      expect(ok).toBe(true);
    });

    // Assert
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.roles).toContain("Administrador");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("debe manejar error de login con mensaje de error", async () => {
    // Arrange
    (mockAuthService.login as unknown as vi.Mock).mockRejectedValue(
      new Error("Credenciales inválidas.")
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Act
    await act(async () => {
      const ok = await result.current.login("wrong@example.com", "bad");
      expect(ok).toBe(false);
    });

    // Assert
    expect(result.current.error).toBe("Credenciales inválidas.");
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("hasRole debe devolver true sólo si el usuario tiene el rol solicitado", async () => {
    // Arrange
    (mockAuthService.getCurrentUser as unknown as vi.Mock).mockResolvedValue({
      id: 2,
      full_name: "Docente",
      email: "teacher@example.com",
      roles: ["Docente"]
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Act
    await act(async () => {
      await result.current.refreshUser();
    });

    // Assert
    expect(result.current.hasRole(["Docente"])).toBe(true);
    expect(result.current.hasRole(["Administrador"])).toBe(false);
  });
});

