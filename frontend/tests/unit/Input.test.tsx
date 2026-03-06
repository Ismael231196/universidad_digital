import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Input } from "../../src/components/Input";

describe("Input", () => {
  it("debe renderizar label y input asociados (caso normal)", () => {
    // Arrange
    const label = "Correo electrónico";

    // Act
    render(<Input label={label} name="email" />);

    // Assert
    const input = screen.getByLabelText(label);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "email");
  });

  it("debe generar id a partir del label si no se pasa name ni id (caso límite)", () => {
    // Arrange
    const label = "Nombre completo";

    // Act
    render(<Input label={label} />);

    // Assert
    const input = screen.getByLabelText(label);
    expect(input).toHaveAttribute("id", "nombre-completo");
  });

  it("debe mostrar mensaje de error accesible cuando hay error (caso inválido)", () => {
    // Arrange
    const errorMessage = "Campo obligatorio";

    // Act
    render(<Input label="Campo" name="campo" error={errorMessage} />);

    // Assert
    const input = screen.getByLabelText("Campo");
    const error = screen.getByRole("alert");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "campo-error");
    expect(error).toHaveTextContent(errorMessage);
  });
});

