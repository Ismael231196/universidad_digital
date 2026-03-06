import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Table } from "../../src/components/Table";

type Row = { id: number; name: string; email: string };

describe("Table", () => {
  const data: Row[] = [
    { id: 1, name: "Alumno 1", email: "a1@example.com" },
    { id: 2, name: "Alumno 2", email: "a2@example.com" }
  ];

  const columns = [
    { header: "Nombre", render: (row: Row) => row.name },
    { header: "Correo", render: (row: Row) => row.email }
  ];

  it("debe renderizar encabezados y filas correctamente", () => {
    // Arrange & Act
    render(<Table caption="Alumnos" columns={columns} data={data} />);

    // Assert
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Correo")).toBeInTheDocument();
    expect(screen.getByText("Alumno 1")).toBeInTheDocument();
    expect(screen.getByText("a2@example.com")).toBeInTheDocument();
  });

  it("debe renderizar caption como sr-only (accesibilidad)", () => {
    // Arrange & Act
    render(<Table caption="Alumnos" columns={columns} data={data} />);

    // Assert
    const caption = screen.getByText("Alumnos");
    expect(caption.tagName.toLowerCase()).toBe("caption");
  });
});

