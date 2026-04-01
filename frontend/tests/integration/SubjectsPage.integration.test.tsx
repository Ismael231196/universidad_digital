import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { SubjectsPage } from "../../src/pages/admin/SubjectsPage";

const useFetchMock = vi.fn();
const createSubjectMock = vi.fn();
const deactivateSubjectMock = vi.fn();

vi.mock("../../src/hooks/useFetch", () => ({
  useFetch: (...args: unknown[]) => useFetchMock(...args)
}));

vi.mock("../../src/services/subjectsService", () => ({
  subjectsService: {
    list: vi.fn(),
    create: (...args: unknown[]) => createSubjectMock(...args),
    update: vi.fn(),
    deactivate: (...args: unknown[]) => deactivateSubjectMock(...args)
  }
}));

vi.mock("../../src/layouts/DashboardLayout", () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe("SubjectsPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza listado de materias", () => {
    useFetchMock.mockReturnValue({
      data: [
        {
          id: 1,
          code: "MAT101",
          name: "Matemáticas",
          credits: 4,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ],
      error: null,
      isLoading: false,
      reload: vi.fn()
    });

    render(<SubjectsPage />);

    expect(screen.getByText("MAT101")).toBeInTheDocument();
    expect(screen.getByText("Matemáticas")).toBeInTheDocument();
  });

  it("crea materia y recarga listado", async () => {
    const reload = vi.fn().mockResolvedValue(undefined);
    createSubjectMock.mockResolvedValue(undefined);

    useFetchMock.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      reload
    });

    render(<SubjectsPage />);

    fireEvent.change(screen.getByLabelText(/^código$/i), { target: { value: "FIS201" } });
    fireEvent.change(screen.getByLabelText(/^nombre$/i), { target: { value: "Física" } });
    fireEvent.change(screen.getByLabelText(/^créditos$/i), { target: { value: "3" } });

    fireEvent.click(screen.getByRole("button", { name: /^crear$/i }));

    await waitFor(() => {
      expect(createSubjectMock).toHaveBeenCalledWith({
        code: "FIS201",
        name: "Física",
        credits: 3
      });
    });

    await waitFor(() => {
      expect(reload).toHaveBeenCalledTimes(1);
    });
  });

  it("desactiva materia y muestra confirmación", async () => {
    const reload = vi.fn().mockResolvedValue(undefined);
    deactivateSubjectMock.mockResolvedValue(undefined);

    useFetchMock.mockReturnValue({
      data: [
        {
          id: 33,
          code: "QUI101",
          name: "Química",
          credits: 4,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ],
      error: null,
      isLoading: false,
      reload
    });

    render(<SubjectsPage />);

    fireEvent.click(screen.getByRole("button", { name: /desactivar/i }));

    await waitFor(() => {
      expect(deactivateSubjectMock).toHaveBeenCalledWith(33);
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/materia desactivada/i);
  });
});
