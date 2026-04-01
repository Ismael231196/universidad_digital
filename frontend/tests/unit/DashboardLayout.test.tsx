import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { DashboardLayout } from "../../src/layouts/DashboardLayout";

const logoutMock = vi.fn(async () => {});

let authState = {
  user: {
    id: 1,
    email: "admin@example.com",
    full_name: "Admin",
    is_active: true,
    created_at: new Date().toISOString(),
    roles: ["Administrador"] as string[]
  },
  logout: logoutMock
};

vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: () => authState
}));

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <DashboardLayout>
        <div>Contenido interno</div>
      </DashboardLayout>
    </MemoryRouter>
  );
}

describe("DashboardLayout", () => {
  beforeEach(() => {
    logoutMock.mockClear();
    authState = {
      user: {
        id: 1,
        email: "admin@example.com",
        full_name: "Admin",
        is_active: true,
        created_at: new Date().toISOString(),
        roles: ["Administrador"]
      },
      logout: logoutMock
    };
  });

  it("renderiza datos básicos del usuario y contenido hijo", () => {
    renderLayout();

    expect(screen.getByText(/universidad digital/i)).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Contenido interno")).toBeInTheDocument();
  });

  it("muestra menú de administrador y no menú docente", () => {
    renderLayout();

    expect(screen.getByRole("link", { name: /panel admin/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /usuarios/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /panel docente/i })).not.toBeInTheDocument();
  });

  it("muestra menú docente cuando el rol es Docente", () => {
    authState = {
      user: {
        id: 2,
        email: "teacher@example.com",
        full_name: "Teacher",
        is_active: true,
        created_at: new Date().toISOString(),
        roles: ["Docente"]
      },
      logout: logoutMock
    };

    renderLayout();

    expect(screen.getByRole("link", { name: /panel docente/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /calificaciones/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /panel admin/i })).not.toBeInTheDocument();
  });

  it("ejecuta logout al hacer clic en Cerrar sesión", () => {
    renderLayout();

    fireEvent.click(screen.getByRole("button", { name: /cerrar sesión/i }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
