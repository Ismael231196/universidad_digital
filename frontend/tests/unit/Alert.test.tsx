import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Alert } from "../../src/components/Alert";

describe("Alert", () => {
  it("debe renderizar mensaje de error por defecto", () => {
    // Arrange
    const message = "Ha ocurrido un error";

    // Act
    render(<Alert message={message} />);

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(message);
    expect(alert).toHaveClass("error");
  });

  it("debe soportar variante success", () => {
    // Arrange
    const message = "Operación exitosa";

    // Act
    render(<Alert message={message} variant="success" />);

    // Assert
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(message);
    expect(alert).toHaveClass("success");
  });
});

