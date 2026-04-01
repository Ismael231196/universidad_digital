type SessionUser = {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  roles: string[];
};

function mockSession(user: SessionUser | null) {
  cy.intercept("POST", /\/auth\/logout(?:\?.*)?$/, { statusCode: 204, body: {} });

  if (user) {
    cy.intercept("GET", /\/auth\/me(?:\?.*)?$/, { statusCode: 200, body: user });
    return;
  }

  cy.intercept("GET", /\/auth\/me(?:\?.*)?$/, {
    statusCode: 401,
    body: { detail: "No autenticado" }
  });
}

describe("RBAC y navegación", () => {
  it("admin ve menú completo y navega a usuarios", () => {
    mockSession({
      id: 1,
      email: "admin@example.com",
      full_name: "Admin",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
      roles: ["Administrador"]
    });

    cy.intercept("GET", /\/users(?:\?.*)?$/, { statusCode: 200, body: [] });
    cy.intercept("GET", /\/roles(?:\?.*)?$/, {
      statusCode: 200,
      body: [{ id: 1, name: "Administrador", description: "Admin", created_at: "2026-01-01" }]
    });

    cy.visit("/admin");

    cy.get('nav[aria-label="Menú principal"]').within(() => {
      cy.contains("a", /Usuarios/i).should("be.visible").click();
    });

    cy.url().should("include", "/admin/users");
    cy.contains("h2", /Crear usuario/i).should("be.visible");
  });

  it("docente no puede entrar a /admin", () => {
    mockSession({
      id: 2,
      email: "teacher@example.com",
      full_name: "Teacher",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
      roles: ["Docente"]
    });

    cy.visit("/admin");
    cy.url().should("include", "/denied");
    cy.contains("h1", /Acceso denegado/i).should("be.visible");
  });

  it("estudiante no puede entrar a /teacher/grades", () => {
    mockSession({
      id: 3,
      email: "student@example.com",
      full_name: "Student",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
      roles: ["Estudiante"]
    });

    cy.visit("/teacher/grades");
    cy.url().should("include", "/denied");
    cy.contains("h1", /Acceso denegado/i).should("be.visible");
  });

  it("sin sesión redirige de ruta protegida a login", () => {
    mockSession(null);

    cy.visit("/student");
    cy.url().should("include", "/login");
    cy.contains("h1", /Iniciar sesi.n/i).should("be.visible");
  });

  it("ruta inexistente muestra 404", () => {
    mockSession({
      id: 1,
      email: "admin@example.com",
      full_name: "Admin",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
      roles: ["Administrador"]
    });

    cy.visit("/ruta-que-no-existe");
    cy.contains("h1", "404").should("be.visible");
    cy.contains(/La página solicitada no existe/i).should("be.visible");
  });
});
