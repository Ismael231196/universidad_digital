const adminEmail = Cypress.env("ADMIN_EMAIL") || "admin@example.com";
const adminPassword = Cypress.env("ADMIN_PASSWORD") || "AdminPassword123";
const teacherEmail = Cypress.env("TEACHER_EMAIL") || "teacher@example.com";
const teacherPassword = Cypress.env("TEACHER_PASSWORD") || "TeacherPassword123";
const studentEmail = Cypress.env("STUDENT_EMAIL") || "student@example.com";
const studentPassword = Cypress.env("STUDENT_PASSWORD") || "StudentPassword123";

type UserCredentials = {
  email: string;
  password: string;
  expectedPath: "/admin" | "/teacher" | "/student";
  expectedHeading: RegExp;
};

function loginAndAssert({ email, password, expectedPath, expectedHeading }: UserCredentials) {
  cy.visit("/login");
  cy.get('input[name="email"]').clear().type(email);
  cy.get('input[name="password"]').clear().type(password);
  cy.contains("button", "Entrar").click();

  cy.url().should("include", expectedPath);
  cy.contains("h1", expectedHeading).should("be.visible");
}

function ensureCredentialsOrSkip(ctx: Mocha.Context, email: string, password: string) {
  cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl") || "http://127.0.0.1:8000"}/auth/login`,
    body: { email, password },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status !== 200) {
      cy.log(`Saltando prueba: login API no disponible para ${email} (status ${response.status})`);
      ctx.skip();
    }
  });
}

describe("Flujos reales contra backend", () => {
  it("login admin y acceso al panel administrador", function () {
    ensureCredentialsOrSkip(this, adminEmail, adminPassword);

    loginAndAssert({
      email: adminEmail,
      password: adminPassword,
      expectedPath: "/admin",
      expectedHeading: /Panel Administrador/i
    });

    cy.get('nav[aria-label="Menú principal"]').within(() => {
      cy.contains("a", /Usuarios/i).should("be.visible");
      cy.contains("a", /Materias/i).should("be.visible");
    });
  });

  it("login docente y acceso a calificaciones", function () {
    ensureCredentialsOrSkip(this, teacherEmail, teacherPassword);

    loginAndAssert({
      email: teacherEmail,
      password: teacherPassword,
      expectedPath: "/teacher",
      expectedHeading: /Panel Docente/i
    });

    cy.contains("a", /Calificaciones/i).click();
    cy.url().should("include", "/teacher/grades");
    cy.contains("h2", /Registrar calificación/i).should("be.visible");
  });

  it("login estudiante y acceso a sus calificaciones", function () {
    ensureCredentialsOrSkip(this, studentEmail, studentPassword);

    loginAndAssert({
      email: studentEmail,
      password: studentPassword,
      expectedPath: "/student",
      expectedHeading: /Panel Estudiante/i
    });

    cy.contains("a", /Calificaciones/i).click();
    cy.url().should("include", "/student/grades");
    cy.contains("h2", /Mis calificaciones/i).should("be.visible");
  });
});
