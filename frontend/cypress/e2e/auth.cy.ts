describe("Autenticacion y control de acceso", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/auth/me", {
      statusCode: 401,
      body: { detail: "No autenticado" }
    }).as("getMeUnauthenticated");

    cy.intercept("POST", "**/auth/logout", {
      statusCode: 200,
      body: {}
    }).as("logout");
  });

  it("redirecciona a login cuando no hay sesion", () => {
    cy.visit("/admin");
    cy.url().should("include", "/login");
    cy.contains("h1", /Iniciar sesi.n/i).should("be.visible");
  });

  it("muestra error con credenciales invalidas", () => {
    cy.intercept("POST", "**/auth/login", {
      statusCode: 401,
      body: { detail: "Credenciales invalidas" }
    }).as("loginError");

    cy.visit("/login");

    cy.get('input[name="email"]').type("usuario-invalido@example.com");
    cy.get('input[name="password"]').type("Password123");
    cy.contains("button", "Entrar").click();

    cy.wait("@loginError");
    cy.contains("Credenciales invalidas", { matchCase: false }).should("be.visible");
    cy.url().should("include", "/login");
  });

  it("permite iniciar sesion como admin y entrar al panel", () => {
    cy.intercept("POST", "**/auth/login", {
      statusCode: 200,
      body: {
        access_token: "fake-admin-token",
        token_type: "bearer"
      }
    }).as("loginOk");

    cy.intercept("GET", "**/auth/me", (req) => {
      const authHeader = req.headers.authorization;
      if (authHeader === "Bearer fake-admin-token") {
        req.reply({
          statusCode: 200,
          body: {
            id: 1,
            email: "admin@example.com",
            full_name: "Administrador Cypress",
            is_active: true,
            created_at: "2026-01-01T00:00:00Z",
            roles: ["Administrador"]
          }
        });
        return;
      }

      req.reply({
        statusCode: 401,
        body: { detail: "No autenticado" }
      });
    }).as("getMe");

    cy.visit("/login");
    cy.get('input[name="email"]').type("admin@example.com");
    cy.get('input[name="password"]').type("AdminPassword123");
    cy.contains("button", "Entrar").click();

    cy.wait("@loginOk");
    cy.wait("@getMe");

    cy.url().should("include", "/admin");
    cy.contains("h1", "Panel Administrador").should("be.visible");
    cy.contains("Administrador Cypress").should("be.visible");
  });

  it("bloquea ruta admin para rol estudiante", () => {
    cy.intercept("GET", "**/auth/me", {
      statusCode: 200,
      body: {
        id: 2,
        email: "student@example.com",
        full_name: "Estudiante Cypress",
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
        roles: ["Estudiante"]
      }
    }).as("getMeStudent");

    cy.visit("/admin");
    cy.wait("@getMeStudent");

    cy.url().should("include", "/denied");
    cy.contains("h1", "Acceso denegado").should("be.visible");
  });
});
