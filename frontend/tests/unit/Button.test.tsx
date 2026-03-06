import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { Button } from "../../src/components/Button";

describe("Button", () => {
  it("debe renderizar el texto correctamente (caso normal)", () => {
    // Arrange
    const label = "Guardar cambios";

    // Act
    render(<Button type="button">{label}</Button>);

    // Assert
    expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
  });

  it("debe llamar al onClick una sola vez (AAA + determinista)", () => {
    // Arrange
    const handleClick = vi.fn();

    render(
      <Button type="button" onClick={handleClick}>
        Click
      </Button>
    );

    const button = screen.getByRole("button", { name: "Click" });

    // Act
    fireEvent.click(button);

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("debe estar deshabilitado cuando isLoading es true (caso límite)", () => {
    // Arrange
    render(
      <Button type="button" isLoading>
        Cargando
      </Button>
    );

    // Act
    const button = screen.getByRole("button");

    // Assert
    expect(button).toBeDisabled();
  });
});

