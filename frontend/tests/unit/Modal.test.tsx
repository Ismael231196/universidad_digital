import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { Modal } from "../../src/components/Modal";

describe("Modal", () => {
  it("no debe renderizar nada cuando isOpen es false", () => {
    // Arrange & Act
    const { container } = render(
      <Modal title="Título" isOpen={false} onClose={() => {}}>
        Contenido
      </Modal>
    );

    // Assert
    expect(container).toBeEmptyDOMElement();
  });

  it("debe mostrar título y contenido cuando está abierto", () => {
    // Arrange & Act
    render(
      <Modal title="Título modal" isOpen onClose={() => {}}>
        Contenido importante
      </Modal>
    );

    // Assert
    expect(screen.getByRole("dialog", { name: "Título modal" })).toBeInTheDocument();
    expect(screen.getByText("Contenido importante")).toBeInTheDocument();
  });

  it("debe disparar onClose al hacer clic en Cerrar", () => {
    // Arrange
    const handleClose = vi.fn();
    render(
      <Modal title="Modal" isOpen onClose={handleClose}>
        Contenido
      </Modal>
    );

    const closeButton = screen.getByRole("button", { name: /cerrar/i });

    // Act
    fireEvent.click(closeButton);

    // Assert
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

