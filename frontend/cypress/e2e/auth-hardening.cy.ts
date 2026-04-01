describe("Autenticación robusta", () => {
  it("redirige a /500 cuando /auth/me responde error 500", () => {
    cy.intercept("GET", /\/auth\/me(?:\?.*)?$/, {
      statusCode: 500,
      body: { detail: "Error interno" }
    });

    cy.visit("/");
    cy.url().should("include", "/500");
    cy.contains("h1", /Error del servidor/i).should("be.visible");
  });

  it("logout desde dashboard devuelve al login", () => {
    let loggedOut = false;
    const apiLogout = /^https?:\/\/(127\.0\.0\.1|localhost):8000\/auth\/logout(?:\?.*)?$/;
    const apiMe = /^https?:\/\/(127\.0\.0\.1|localhost):8000\/auth\/me(?:\?.*)?$/;

    cy.intercept("GET", apiMe, (req) => {
      if (!loggedOut) {
        req.reply({
          statusCode: 200,
          body: {
            id: 1,
            email: "admin@example.com",
            full_name: "Admin",
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
    });

    cy.intercept("OPTIONS", apiLogout, {
      statusCode: 204,
      headers: {
        "access-control-allow-origin": "http://localhost:3001",
        "access-control-allow-headers": "authorization,content-type",
        "access-control-allow-methods": "POST,OPTIONS",
        "access-control-allow-credentials": "true"
      }
    });

    cy.intercept("POST", apiLogout, () => {
      loggedOut = true;
      return {
        statusCode: 204,
        body: {},
        headers: {
          "access-control-allow-origin": "http://localhost:3001",
          "access-control-allow-credentials": "true"
        }
      };
    });

    cy.on("uncaught:exception", (err) => {
      if (String(err.message).includes("Network Error")) {
        return false;
      }
      return undefined;
    });

    cy.visit("/admin");
    cy.contains("button", /Cerrar sesión/i).click();

    cy.url().should("include", "/login");
    cy.contains("h1", /Iniciar sesi.n/i).should("be.visible");
  });

  it("home redirige por rol Docente", () => {
    cy.intercept("GET", /\/auth\/me(?:\?.*)?$/, {
      statusCode: 200,
      body: {
        id: 2,
        email: "teacher@example.com",
        full_name: "Teacher",
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
        roles: ["Docente"]
      }
    });

    cy.visit("/");
    cy.url().should("include", "/teacher");
    cy.contains("h1", /Panel Docente/i).should("be.visible");
  });

  it("login inválido mantiene usuario en /login", () => {
    cy.intercept("GET", /\/auth\/me(?:\?.*)?$/, {
      statusCode: 401,
      body: { detail: "No autenticado" }
    });
    cy.intercept("POST", /\/auth\/logout(?:\?.*)?$/, { statusCode: 204, body: {} });
    cy.intercept("POST", /\/auth\/login(?:\?.*)?$/, {
      statusCode: 401,
      body: { detail: "Credenciales inválidas" }
    }).as("loginFailed");

    cy.visit("/login");
    cy.get('input[name="email"]').type("bad@example.com");
    cy.get('input[name="password"]').type("Password123");
    cy.contains("button", "Entrar").click();

    cy.wait("@loginFailed");
    cy.url().should("include", "/login");
    cy.contains(/Credenciales inválidas|Credenciales invalidas/i).should("be.visible");
  });
});
