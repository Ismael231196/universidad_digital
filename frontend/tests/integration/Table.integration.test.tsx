import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Table } from "../../src/components/Table";

type Row = { id: number; name: string; email: string };

const data: Row[] = [
  { id: 1, name: "Alumno 1", email: "a1@example.com" },
  { id: 2, name: "Alumno 2", email: "a2@example.com" }
];

const columns = [
  { header: "Nombre", render: (row: Row) => row.name },
  { header: "Correo", render: (row: Row) => row.email }
];

describe("Table integration", () => {
  it("renderiza caption, encabezados y filas", () => {
    render(<Table caption="Listado de alumnos" columns={columns} data={data} />);

    expect(screen.getByText("Listado de alumnos")).toBeInTheDocument();
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Correo")).toBeInTheDocument();
    expect(screen.getByText("Alumno 1")).toBeInTheDocument();
    expect(screen.getByText("a2@example.com")).toBeInTheDocument();
  });

  it("renderiza cuerpo vacío cuando no hay datos", () => {
    render(<Table caption="Vacía" columns={columns} data={[]} />);
    expect(screen.getByText("Vacía")).toBeInTheDocument();
    expect(screen.queryByText("Alumno 1")).not.toBeInTheDocument();
  });
});
