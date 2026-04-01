import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";

import { PeriodsPage } from "../../src/pages/admin/PeriodsPage";

const useFetchMock = vi.fn();
const createPeriodMock = vi.fn();
const updatePeriodMock = vi.fn();
const deactivatePeriodMock = vi.fn();

vi.mock("../../src/hooks/useFetch", () => ({
  useFetch: (...args: unknown[]) => useFetchMock(...args)
}));

vi.mock("../../src/services/periodsService", () => ({
  periodsService: {
    list: vi.fn(),
    create: (...args: unknown[]) => createPeriodMock(...args),
    update: (...args: unknown[]) => updatePeriodMock(...args),
    deactivate: (...args: unknown[]) => deactivatePeriodMock(...args)
  }
}));

vi.mock("../../src/layouts/DashboardLayout", () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe("PeriodsPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza periodos en la tabla", () => {
    useFetchMock.mockReturnValue({
      data: [
        {
          id: 1,
          code: "2026-1",
          name: "Periodo 2026-1",
          start_date: "2026-01-15",
          end_date: "2026-06-15",
          is_active: true,
          created_at: new Date().toISOString()
        }
      ],
      error: null,
      isLoading: false,
      reload: vi.fn()
    });

    render(<PeriodsPage />);

    expect(screen.getByText("2026-1")).toBeInTheDocument();
    expect(screen.getByText("Periodo 2026-1")).toBeInTheDocument();
    expect(screen.getByText("2026-01-15")).toBeInTheDocument();
  });

  it("crea periodo con payload esperado y recarga", async () => {
    const reload = vi.fn().mockResolvedValue(undefined);
    createPeriodMock.mockResolvedValue(undefined);

    useFetchMock.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      reload
    });

    render(<PeriodsPage />);

    fireEvent.change(screen.getByLabelText(/^código$/i), { target: { value: "2026-2" } });
    fireEvent.change(screen.getByLabelText(/^nombre$/i), { target: { value: "Periodo 2026-2" } });
    fireEvent.change(screen.getByLabelText(/fecha inicio/i), { target: { value: "2026-07-01" } });
    fireEvent.change(screen.getByLabelText(/fecha fin/i), { target: { value: "2026-12-01" } });

    fireEvent.click(screen.getByRole("button", { name: /^crear$/i }));

    await waitFor(() => {
      expect(createPeriodMock).toHaveBeenCalledWith({
        code: "2026-2",
        name: "Periodo 2026-2",
        start_date: "2026-07-01",
        end_date: "2026-12-01"
      });
    });

    await waitFor(() => {
      expect(reload).toHaveBeenCalledTimes(1);
    });
  });

  it("actualiza periodo usando id numérico", async () => {
    const reload = vi.fn().mockResolvedValue(undefined);
    updatePeriodMock.mockResolvedValue(undefined);

    useFetchMock.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      reload
    });

    render(<PeriodsPage />);

    const updateCard = screen.getByRole("heading", { name: /actualizar periodo/i }).closest(".card");
    if (!updateCard) {
      throw new Error("No se encontró el contenedor del formulario de actualización de periodos");
    }
    const scoped = within(updateCard);
    const idInput = updateCard.querySelector('input[name="id"]') as HTMLInputElement | null;
    const nameInput = updateCard.querySelector('input[name="name"]') as HTMLInputElement | null;
    if (!idInput || !nameInput) {
      throw new Error("No se encontraron inputs de actualización de periodo");
    }

    fireEvent.change(idInput, { target: { value: "12" } });
    fireEvent.change(nameInput, { target: { value: "Periodo Actualizado" } });

    fireEvent.click(scoped.getByRole("button", { name: /^actualizar$/i }));

    await waitFor(() => {
      expect(updatePeriodMock).toHaveBeenCalledWith(12, {
        name: "Periodo Actualizado",
        start_date: undefined,
        end_date: undefined
      });
    });
  });

  it("desactiva periodo y muestra feedback", async () => {
    const reload = vi.fn().mockResolvedValue(undefined);
    deactivatePeriodMock.mockResolvedValue(undefined);

    useFetchMock.mockReturnValue({
      data: [
        {
          id: 33,
          code: "2025-2",
          name: "Periodo 2025-2",
          start_date: "2025-07-01",
          end_date: "2025-12-01",
          is_active: true,
          created_at: new Date().toISOString()
        }
      ],
      error: null,
      isLoading: false,
      reload
    });

    render(<PeriodsPage />);

    fireEvent.click(screen.getByRole("button", { name: /desactivar/i }));

    await waitFor(() => {
      expect(deactivatePeriodMock).toHaveBeenCalledWith(33);
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/periodo desactivado/i);
  });
});
