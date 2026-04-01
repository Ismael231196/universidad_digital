type TestUser = {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  roles: string[];
};

type TestRole = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
};

type TestSubject = {
  id: number;
  code: string;
  name: string;
  credits: number;
  is_active: boolean;
  created_at: string;
};

type TestPeriod = {
  id: number;
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
};

type TestEnrollment = {
  id: number;
  user_id: number;
  subject_id: number;
  period_id: number;
  is_active: boolean;
  enrolled_at: string;
};

function idFromUrl(url: string): number {
  const clean = url.split("?")[0];
  const value = clean.substring(clean.lastIndexOf("/") + 1);
  return Number(value);
}

describe("CRUD admin con Cypress", () => {
  const apiUrlRegex = (path: string) =>
    new RegExp(`^https?:\\/\\/(127\\.0\\.0\\.1|localhost):8000${path}(?:\\?.*)?$`);

  let users: TestUser[];
  let roles: TestRole[];
  let subjects: TestSubject[];
  let periods: TestPeriod[];
  let enrollments: TestEnrollment[];

  let userSeq = 3;
  let subjectSeq = 2;
  let periodSeq = 2;
  let enrollmentSeq = 2;

  beforeEach(() => {
    users = [
      {
        id: 1,
        email: "admin@example.com",
        full_name: "Administrador",
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
        roles: ["Administrador"]
      },
      {
        id: 2,
        email: "student@example.com",
        full_name: "Estudiante Demo",
        is_active: true,
        created_at: "2026-01-02T00:00:00Z",
        roles: ["Estudiante"]
      }
    ];

    roles = [
      { id: 1, name: "Administrador", description: "Admin", created_at: "2026-01-01T00:00:00Z" },
      { id: 2, name: "Estudiante", description: "Student", created_at: "2026-01-01T00:00:00Z" },
      { id: 3, name: "Docente", description: "Teacher", created_at: "2026-01-01T00:00:00Z" }
    ];

    subjects = [
      {
        id: 1,
        code: "MAT101",
        name: "Matematicas",
        credits: 4,
        is_active: true,
        created_at: "2026-01-01T00:00:00Z"
      }
    ];

    periods = [
      {
        id: 1,
        code: "2026-1",
        name: "Periodo 2026-1",
        start_date: "2026-01-15",
        end_date: "2026-06-15",
        is_active: true,
        created_at: "2026-01-01T00:00:00Z"
      }
    ];

    enrollments = [
      {
        id: 1,
        user_id: 2,
        subject_id: 1,
        period_id: 1,
        is_active: true,
        enrolled_at: "2026-01-20T00:00:00Z"
      }
    ];

    cy.intercept("POST", apiUrlRegex("/auth/login"), {
      statusCode: 200,
      body: { access_token: "fake-admin-token", token_type: "bearer" }
    });

    cy.intercept("GET", apiUrlRegex("/auth/me"), {
      statusCode: 200,
      body: users[0]
    });

    cy.intercept("POST", apiUrlRegex("/auth/logout"), { statusCode: 204, body: {} });

    cy.intercept("GET", apiUrlRegex("/roles"), (req) => {
      req.reply({ statusCode: 200, body: roles });
    });

    cy.intercept("GET", apiUrlRegex("/users"), (req) => {
      req.reply({ statusCode: 200, body: users });
    });

    cy.intercept("POST", apiUrlRegex("/users"), (req) => {
      const payload = req.body as {
        email: string;
        full_name: string;
        role_ids?: number[];
      };
      const roleNames = (payload.role_ids || [])
        .map((roleId) => roles.find((role) => role.id === roleId)?.name)
        .filter((name): name is string => Boolean(name));

      const created: TestUser = {
        id: userSeq++,
        email: payload.email,
        full_name: payload.full_name,
        is_active: true,
        created_at: new Date().toISOString(),
        roles: roleNames.length > 0 ? roleNames : ["Estudiante"]
      };
      users.push(created);
      req.reply({ statusCode: 201, body: created });
    });

    cy.intercept("PUT", apiUrlRegex("/users/\\d+"), (req) => {
      const userId = idFromUrl(req.url);
      const target = users.find((user) => user.id === userId);
      if (!target) {
        req.reply({ statusCode: 404, body: { detail: "Usuario no encontrado" } });
        return;
      }
      const payload = req.body as { full_name?: string; is_active?: boolean };
      if (typeof payload.full_name === "string") {
        target.full_name = payload.full_name;
      }
      if (typeof payload.is_active === "boolean") {
        target.is_active = payload.is_active;
      }
      req.reply({ statusCode: 200, body: target });
    });

    cy.intercept("GET", apiUrlRegex("/subjects"), (req) => {
      req.reply({ statusCode: 200, body: subjects });
    });

    cy.intercept("POST", apiUrlRegex("/subjects"), (req) => {
      const payload = req.body as { code: string; name: string; credits: number };
      const created: TestSubject = {
        id: subjectSeq++,
        code: payload.code,
        name: payload.name,
        credits: Number(payload.credits),
        is_active: true,
        created_at: new Date().toISOString()
      };
      subjects.push(created);
      req.reply({ statusCode: 201, body: created });
    });

    cy.intercept("PUT", apiUrlRegex("/subjects/\\d+"), (req) => {
      const id = idFromUrl(req.url);
      const target = subjects.find((subject) => subject.id === id);
      if (!target) {
        req.reply({ statusCode: 404, body: { detail: "Materia no encontrada" } });
        return;
      }
      const payload = req.body as { name?: string; credits?: number };
      if (typeof payload.name === "string") {
        target.name = payload.name;
      }
      if (typeof payload.credits === "number") {
        target.credits = payload.credits;
      }
      req.reply({ statusCode: 200, body: target });
    });

    cy.intercept("DELETE", apiUrlRegex("/subjects/\\d+"), (req) => {
      const id = idFromUrl(req.url);
      const target = subjects.find((subject) => subject.id === id);
      if (!target) {
        req.reply({ statusCode: 404, body: { detail: "Materia no encontrada" } });
        return;
      }
      target.is_active = false;
      req.reply({ statusCode: 200, body: target });
    });

    cy.intercept("GET", apiUrlRegex("/periods"), (req) => {
      req.reply({ statusCode: 200, body: periods });
    });

    cy.intercept("POST", apiUrlRegex("/periods"), (req) => {
      const payload = req.body as {
        code: string;
        name: string;
        start_date: string;
        end_date: string;
      };
      const created: TestPeriod = {
        id: periodSeq++,
        code: payload.code,
        name: payload.name,
        start_date: payload.start_date,
        end_date: payload.end_date,
        is_active: true,
        created_at: new Date().toISOString()
      };
      periods.push(created);
      req.reply({ statusCode: 201, body: created });
    });

    cy.intercept("PUT", apiUrlRegex("/periods/\\d+"), (req) => {
      const id = idFromUrl(req.url);
      const target = periods.find((period) => period.id === id);
      if (!target) {
        req.reply({ statusCode: 404, body: { detail: "Periodo no encontrado" } });
        return;
      }
      const payload = req.body as {
        name?: string;
        start_date?: string;
        end_date?: string;
      };
      if (typeof payload.name === "string") {
        target.name = payload.name;
      }
      if (typeof payload.start_date === "string") {
        target.start_date = payload.start_date;
      }
      if (typeof payload.end_date === "string") {
        target.end_date = payload.end_date;
      }
      req.reply({ statusCode: 200, body: target });
    });

    cy.intercept("DELETE", apiUrlRegex("/periods/\\d+"), (req) => {
      const id = idFromUrl(req.url);
      const target = periods.find((period) => period.id === id);
      if (!target) {
        req.reply({ statusCode: 404, body: { detail: "Periodo no encontrado" } });
        return;
      }
      target.is_active = false;
      req.reply({ statusCode: 200, body: target });
    });

    cy.intercept("GET", apiUrlRegex("/enrollments"), (req) => {
      req.reply({ statusCode: 200, body: enrollments });
    });

    cy.intercept("POST", apiUrlRegex("/enrollments"), (req) => {
      const payload = req.body as { user_id: number; subject_id: number; period_id: number };
      const created: TestEnrollment = {
        id: enrollmentSeq++,
        user_id: Number(payload.user_id),
        subject_id: Number(payload.subject_id),
        period_id: Number(payload.period_id),
        is_active: true,
        enrolled_at: new Date().toISOString()
      };
      enrollments.push(created);
      req.reply({ statusCode: 201, body: created });
    });

    cy.intercept("DELETE", apiUrlRegex("/enrollments/\\d+"), (req) => {
      const id = idFromUrl(req.url);
      const target = enrollments.find((enrollment) => enrollment.id === id);
      if (!target) {
        req.reply({ statusCode: 404, body: { detail: "Inscripcion no encontrada" } });
        return;
      }
      target.is_active = false;
      req.reply({ statusCode: 200, body: target });
    });

    cy.visit("/admin");
    cy.url().should("include", "/admin");
  });

  it("CRUD de usuarios: crear, actualizar y desactivar", () => {
    cy.visit("/admin/users");
    cy.contains("h2", "Crear usuario").should("be.visible");

    cy.get('input[name="email"]').type("new.user@example.com");
    cy.get('input[name="full_name"]').first().type("Usuario Nuevo");
    cy.get('input[name="password"]').type("Password123");
    cy.get('select[name="role_id"]').select("2");
    cy.contains("button", "Crear").click();

    cy.contains("Usuario creado correctamente", { matchCase: false }).should("be.visible");
    cy.contains("td", "new.user@example.com").should("be.visible");

    cy.get('input[name="id"]').type("3");
    cy.get('input[name="full_name"]').last().type("Usuario Editado");
    cy.get('select[name="is_active"]').select("false");
    cy.contains("button", "Actualizar").click();

    cy.contains("Usuario actualizado correctamente", { matchCase: false }).should("be.visible");
    cy.contains("td", "Usuario Editado").should("be.visible");
    cy.contains("td", "No").should("be.visible");

    cy.contains("td", "new.user@example.com")
      .parent("tr")
      .within(() => {
        cy.contains("button", "Activar").click();
      });

    cy.contains("Usuario activado", { matchCase: false }).should("be.visible");
  });

  it("CRUD de materias: crear, actualizar y desactivar", () => {
    cy.visit("/admin/subjects");

    cy.get('input[name="code"]').type("FIS101");
    cy.get('input[name="name"]').first().type("Fisica");
    cy.get('input[name="credits"]').first().type("3");
    cy.contains("button", "Crear").click();

    cy.contains("Materia creada", { matchCase: false }).should("be.visible");
    cy.contains("td", "FIS101").should("be.visible");

    cy.get('input[name="id"]').type("2");
    cy.get('input[name="name"]').last().type("Fisica I");
    cy.get('input[name="credits"]').last().type("4");
    cy.contains("button", "Actualizar").click();

    cy.contains("Materia actualizada", { matchCase: false }).should("be.visible");
    cy.contains("td", "Fisica I").should("be.visible");

    cy.contains("td", "FIS101")
      .parent("tr")
      .within(() => {
        cy.contains("button", "Desactivar").click();
      });

    cy.contains("Materia desactivada", { matchCase: false }).should("be.visible");
  });

  it("CRUD de periodos: crear, actualizar y desactivar", () => {
    cy.visit("/admin/periods");

    cy.get('input[name="code"]').type("2026-2");
    cy.get('input[name="name"]').first().type("Periodo 2026-2");
    cy.get('input[name="start_date"]').first().type("2026-07-01");
    cy.get('input[name="end_date"]').first().type("2026-12-01");
    cy.contains("button", "Crear").click();

    cy.contains("Periodo creado", { matchCase: false }).should("be.visible");
    cy.contains("td", "2026-2").should("be.visible");

    cy.get('input[name="id"]').type("2");
    cy.get('input[name="name"]').last().type("Periodo 2026-2 Ajustado");
    cy.contains("button", "Actualizar").click();

    cy.contains("Periodo actualizado", { matchCase: false }).should("be.visible");
    cy.contains("td", "Periodo 2026-2 Ajustado").should("be.visible");

    cy.contains("td", "2026-2")
      .parent("tr")
      .within(() => {
        cy.contains("button", "Desactivar").click();
      });

    cy.contains("Periodo desactivado", { matchCase: false }).should("be.visible");
  });

  it("CRUD de inscripciones: crear y cancelar", () => {
    cy.visit("/admin/enrollments");

    cy.get('select[name="user_id"]').select("2");
    cy.get('select[name="subject_id"]').select("1");
    cy.get('select[name="period_id"]').select("1");
    cy.contains("button", "Crear").click();

    cy.contains("Inscripción creada", { matchCase: false }).should("be.visible");
    cy.contains("td", "2").should("be.visible");

    cy.contains("td", "2")
      .parent("tr")
      .within(() => {
        cy.contains("button", "Cancelar").first().click();
      });

    cy.contains("Inscripción cancelada", { matchCase: false }).should("be.visible");
  });
});
