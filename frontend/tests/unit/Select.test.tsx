import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Select } from "../../src/components/Select";

describe("Select", () => {
  const options = [
    { value: "1", label: "Opción 1" },
    { value: "2", label: "Opción 2" }
  ];

  it("debe renderizar label y opciones correctamente", () => {
    // Arrange & Act
    render(<Select label="Seleccione" name="select" options={options} />);

    // Assert
    const select = screen.getByLabelText("Seleccione");
    expect(select).toBeInTheDocument();
    expect(screen.getByText("Opción 1")).toBeInTheDocument();
    expect(screen.getByText("Opción 2")).toBeInTheDocument();
  });

  it("debe mostrar mensaje de error accesible", () => {
    // Arrange
    const errorMessage = "Selección inválida";

    // Act
    render(
      <Select label="Seleccione" name="select" options={options} error={errorMessage} />
    );

    // Assert
    const select = screen.getByLabelText("Seleccione");
    const error = screen.getByRole("alert");

    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAttribute("aria-describedby", "select-error");
    expect(error).toHaveTextContent(errorMessage);
  });
});

