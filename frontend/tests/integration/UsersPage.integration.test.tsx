import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { UsersPage } from "../../src/pages/admin/UsersPage";

type FetchState = {
  data: unknown;
  error: string | null;
  isLoading: boolean;
  reload: ReturnType<typeof vi.fn>;
};

const useFetchMock = vi.fn();
const createUserMock = vi.fn();
const updateUserMock = vi.fn();

vi.mock("../../src/hooks/useFetch", () => ({
  useFetch: (...args: unknown[]) => useFetchMock(...args)
}));

vi.mock("../../src/services/usersService", () => ({
  usersService: {
    list: vi.fn(),
    create: (...args: unknown[]) => createUserMock(...args),
    update: (...args: unknown[]) => updateUserMock(...args)
  }
}));

vi.mock("../../src/services/rolesService", () => ({
  rolesService: {
    list: vi.fn()
  }
}));

vi.mock("../../src/layouts/DashboardLayout", () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

function mockUseFetch(usersState: FetchState, rolesState: FetchState) {
  let call = 0;
  useFetchMock.mockImplementation(() => {
    call += 1;
    return call % 2 === 1 ? usersState : rolesState;
  });
}

describe("UsersPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra loading mientras users está cargando", () => {
    mockUseFetch(
      { data: null, error: null, isLoading: true, reload: vi.fn() },
      { data: [], error: null, isLoading: false, reload: vi.fn() }
    );

    render(<UsersPage />);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it("muestra error cuando falla la carga de users", () => {
    mockUseFetch(
      {
        data: null,
        error: "Error cargando usuarios",
        isLoading: false,
        reload: vi.fn()
      },
      { data: [], error: null, isLoading: false, reload: vi.fn() }
    );

    render(<UsersPage />);

    expect(screen.getByRole("alert")).toHaveTextContent(/error cargando usuarios/i);
  });

  it("renderiza usuarios en la tabla", () => {
    mockUseFetch(
      {
        data: [
          {
            id: 1,
            email: "admin@example.com",
            full_name: "Administrador",
            is_active: true,
            created_at: new Date().toISOString(),
            roles: ["Administrador"]
          }
        ],
        error: null,
        isLoading: false,
        reload: vi.fn()
      },
      {
        data: [{ id: 10, name: "Administrador", description: "Rol admin" }],
        error: null,
        isLoading: false,
        reload: vi.fn()
      }
    );

    render(<UsersPage />);

    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getAllByText("Administrador").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Sí")).toBeInTheDocument();
  });

  it("crea usuario con role_id convertido a number y recarga listado", async () => {
    const reloadUsers = vi.fn().mockResolvedValue(undefined);
    createUserMock.mockResolvedValue(undefined);

    mockUseFetch(
      { data: [], error: null, isLoading: false, reload: reloadUsers },
      {
        data: [{ id: 20, name: "Estudiante", description: "Rol estudiante" }],
        error: null,
        isLoading: false,
        reload: vi.fn()
      }
    );

    render(<UsersPage />);

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "new@example.com" }
    });
    fireEvent.change(screen.getByLabelText(/nombre completo$/i), {
      target: { value: "Nuevo Usuario" }
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "Passw0rd123" }
    });
    fireEvent.change(screen.getByLabelText(/^rol$/i), {
      target: { value: "20" }
    });

    fireEvent.click(screen.getByRole("button", { name: /^crear$/i }));

    await waitFor(() => {
      expect(createUserMock).toHaveBeenCalledWith({
        email: "new@example.com",
        full_name: "Nuevo Usuario",
        password: "Passw0rd123",
        role_ids: [20]
      });
    });

    await waitFor(() => {
      expect(reloadUsers).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/usuario creado correctamente/i);
  });

  it("toggle de estado llama update con el valor invertido", async () => {
    const reloadUsers = vi.fn().mockResolvedValue(undefined);
    updateUserMock.mockResolvedValue(undefined);

    mockUseFetch(
      {
        data: [
          {
            id: 2,
            email: "student@example.com",
            full_name: "Estudiante",
            is_active: true,
            created_at: new Date().toISOString(),
            roles: ["Estudiante"]
          }
        ],
        error: null,
        isLoading: false,
        reload: reloadUsers
      },
      { data: [], error: null, isLoading: false, reload: vi.fn() }
    );

    render(<UsersPage />);

    fireEvent.click(screen.getByRole("button", { name: /desactivar/i }));

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith(2, { is_active: false });
    });

    await waitFor(() => {
      expect(reloadUsers).toHaveBeenCalledTimes(1);
    });
  });
});
