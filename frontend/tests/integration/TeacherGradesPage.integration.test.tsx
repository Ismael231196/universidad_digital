import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";

import { TeacherGradesPage } from "../../src/pages/teacher/TeacherGradesPage";

type FetchState = {
  data: unknown;
  error: string | null;
  isLoading: boolean;
  reload: ReturnType<typeof vi.fn>;
};

const useFetchMock = vi.fn();
const createGradeMock = vi.fn();
const updateGradeMock = vi.fn();

vi.mock("../../src/hooks/useFetch", () => ({
  useFetch: (...args: unknown[]) => useFetchMock(...args)
}));

vi.mock("../../src/services/gradesService", () => ({
  gradesService: {
    list: vi.fn(),
    create: (...args: unknown[]) => createGradeMock(...args),
    update: (...args: unknown[]) => updateGradeMock(...args)
  }
}));

vi.mock("../../src/services/enrollmentsService", () => ({
  enrollmentsService: {
    list: vi.fn()
  }
}));

vi.mock("../../src/layouts/DashboardLayout", () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

function mockUseFetch(gradesState: FetchState, enrollmentsState: FetchState) {
  let call = 0;
  useFetchMock.mockImplementation(() => {
    call += 1;
    return call % 2 === 1 ? gradesState : enrollmentsState;
  });
}

describe("TeacherGradesPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza calificaciones listadas", () => {
    mockUseFetch(
      {
        data: [
          {
            id: 1,
            enrollment_id: 10,
            enrollment_label: "Matemáticas · 2025-1",
            value: 92,
            notes: "Excelente",
            created_at: new Date().toISOString()
          }
        ],
        error: null,
        isLoading: false,
        reload: vi.fn()
      },
      {
        data: [{ id: 10 }],
        error: null,
        isLoading: false,
        reload: vi.fn()
      }
    );

    render(<TeacherGradesPage />);

    expect(screen.getByText("Matemáticas · 2025-1")).toBeInTheDocument();
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(screen.getByText("Excelente")).toBeInTheDocument();
  });

  it("crea calificación con conversiones numéricas correctas", async () => {
    const reload = vi.fn().mockResolvedValue(undefined);
    createGradeMock.mockResolvedValue(undefined);

    mockUseFetch(
      { data: [], error: null, isLoading: false, reload },
      {
        data: [{ id: 15 }],
        error: null,
        isLoading: false,
        reload: vi.fn()
      }
    );

    render(<TeacherGradesPage />);

    fireEvent.change(screen.getByLabelText(/^inscripción$/i), { target: { value: "15" } });
    fireEvent.change(screen.getByLabelText(/^nota$/i), { target: { value: "88.5" } });
    fireEvent.change(screen.getByLabelText(/notas \(opcional\)/i), {
      target: { value: "Buen trabajo" }
    });

    fireEvent.click(screen.getByRole("button", { name: /^registrar$/i }));

    await waitFor(() => {
      expect(createGradeMock).toHaveBeenCalledWith({
        enrollment_id: 15,
        value: 88.5,
        notes: "Buen trabajo"
      });
    });

    await waitFor(() => {
      expect(reload).toHaveBeenCalledTimes(1);
    });
  });

  it("actualiza calificación con id numérico", async () => {
    const reload = vi.fn().mockResolvedValue(undefined);
    updateGradeMock.mockResolvedValue(undefined);

    mockUseFetch(
      { data: [], error: null, isLoading: false, reload },
      { data: [], error: null, isLoading: false, reload: vi.fn() }
    );

    render(<TeacherGradesPage />);

    const updateCard = screen
      .getByRole("heading", { name: /actualizar calificación/i })
      .closest(".card");
    if (!updateCard) {
      throw new Error("No se encontró el contenedor del formulario de actualización de calificaciones");
    }
    const scoped = within(updateCard);
    const idInput = updateCard.querySelector('input[name="id"]') as HTMLInputElement | null;
    const valueInput = updateCard.querySelector('input[name="value"]') as HTMLInputElement | null;
    if (!idInput || !valueInput) {
      throw new Error("No se encontraron inputs de actualización de calificación");
    }

    fireEvent.change(idInput, { target: { value: "7" } });
    fireEvent.change(valueInput, { target: { value: "95" } });

    fireEvent.click(scoped.getByRole("button", { name: /^actualizar$/i }));

    await waitFor(() => {
      expect(updateGradeMock).toHaveBeenCalledWith(7, {
        value: 95,
        notes: ""
      });
    });
  });

  it("muestra error de fetch cuando falla listGrades", () => {
    mockUseFetch(
      {
        data: null,
        error: "Error al cargar calificaciones",
        isLoading: false,
        reload: vi.fn()
      },
      { data: [], error: null, isLoading: false, reload: vi.fn() }
    );

    render(<TeacherGradesPage />);

    expect(screen.getByRole("alert")).toHaveTextContent(/error al cargar calificaciones/i);
  });

  it("muestra estado vacío cuando no hay calificaciones", () => {
    mockUseFetch(
      { data: [], error: null, isLoading: false, reload: vi.fn() },
      { data: [], error: null, isLoading: false, reload: vi.fn() }
    );

    render(<TeacherGradesPage />);

    expect(screen.getByText(/no hay calificaciones registradas/i)).toBeInTheDocument();
  });
});
