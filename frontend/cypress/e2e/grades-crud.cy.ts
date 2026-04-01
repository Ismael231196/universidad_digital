type Grade = {
  id: number;
  enrollment_id: number;
  value: number;
  notes: string | null;
  created_at: string;
};

type Enrollment = {
  id: number;
  user_id: number;
  subject_id: number;
  period_id: number;
  is_active: boolean;
  enrolled_at: string;
};

function setupGradesApi(role: "Administrador" | "Docente") {
  const apiUrlRegex = (path: string) =>
    new RegExp(`^https?:\\/\\/(127\\.0\\.0\\.1|localhost):8000${path}(?:\\?.*)?$`);

  const user = {
    id: role === "Administrador" ? 1 : 2,
    email: role === "Administrador" ? "admin@example.com" : "teacher@example.com",
    full_name: role === "Administrador" ? "Admin" : "Teacher",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    roles: [role]
  };

  let grades: Grade[] = [
    {
      id: 1,
      enrollment_id: 10,
      value: 80,
      notes: "Inicial",
      created_at: "2026-01-01T00:00:00Z"
    }
  ];

  const enrollments: Enrollment[] = [
    {
      id: 10,
      user_id: 20,
      subject_id: 30,
      period_id: 40,
      is_active: true,
      enrolled_at: "2026-01-01T00:00:00Z"
    }
  ];

  let gradeSeq = 2;

  cy.intercept("GET", apiUrlRegex("/auth/me"), { statusCode: 200, body: user });
  cy.intercept("POST", apiUrlRegex("/auth/logout"), { statusCode: 204, body: {} });

  cy.intercept("GET", apiUrlRegex("/grades"), (req) => {
    req.reply({ statusCode: 200, body: grades });
  });

  cy.intercept("GET", apiUrlRegex("/enrollments"), (req) => {
    req.reply({ statusCode: 200, body: enrollments });
  });

  cy.intercept("POST", apiUrlRegex("/grades"), (req) => {
    const payload = req.body as { enrollment_id: number; value: number; notes?: string | null };
    const created: Grade = {
      id: gradeSeq++,
      enrollment_id: Number(payload.enrollment_id),
      value: Number(payload.value),
      notes: payload.notes ?? null,
      created_at: new Date().toISOString()
    };
    grades.push(created);
    req.reply({ statusCode: 201, body: created });
  }).as("createGrade");

  cy.intercept("PUT", apiUrlRegex("/grades/\\d+"), (req) => {
    const id = Number(req.url.split("?")[0].split("/").pop());
    const target = grades.find((grade) => grade.id === id);
    if (!target) {
      req.reply({ statusCode: 404, body: { detail: "Calificación no encontrada" } });
      return;
    }
    const payload = req.body as { value?: number; notes?: string };
    if (typeof payload.value === "number") {
      target.value = payload.value;
    }
    if (typeof payload.notes === "string") {
      target.notes = payload.notes;
    }
    req.reply({ statusCode: 200, body: target });
  }).as("updateGrade");
}

describe("CRUD de calificaciones", () => {
  it("admin crea calificación y la ve en el listado", () => {
    setupGradesApi("Administrador");

    cy.visit("/admin/grades");
    cy.contains("h2", /Registrar calificación/i).should("be.visible");

    cy.get('select[name="enrollment_id"]').select("10");
    cy.get('input[name="value"]').first().clear().type("95");
    cy.get('input[name="notes"]').first().type("Excelente");
    cy.contains("button", "Registrar").click();

    cy.wait("@createGrade");
    cy.contains(/Calificación registrada/i).should("be.visible");
    cy.contains("td", "95").should("be.visible");
    cy.contains("td", "Excelente").should("be.visible");
  });

  it("admin actualiza calificación existente", () => {
    setupGradesApi("Administrador");

    cy.visit("/admin/grades");
    cy.get('input[name="id"]').type("1");
    cy.get('input[name="value"]').last().clear().type("88");
    cy.get('input[name="notes"]').last().type("Actualizada");
    cy.contains("button", "Actualizar").click();

    cy.wait("@updateGrade");
    cy.contains(/Calificación actualizada/i).should("be.visible");
    cy.contains("td", "88").should("be.visible");
    cy.contains("td", "Actualizada").should("be.visible");
  });

  it("docente gestiona calificaciones en su panel", () => {
    setupGradesApi("Docente");

    cy.visit("/teacher/grades");
    cy.contains("h2", /Registrar calificación/i).should("be.visible");

    cy.get('select[name="enrollment_id"]').select("10");
    cy.get('input[name="value"]').first().clear().type("77");
    cy.contains("button", "Registrar").click();

    cy.wait("@createGrade");
    cy.contains("td", "77").should("be.visible");
  });

  it("valida rango de nota y evita request inválido", () => {
    setupGradesApi("Administrador");

    let createCalled = false;
    cy.intercept("POST", /^https?:\/\/(127\.0\.0\.1|localhost):8000\/grades(?:\?.*)?$/, () => {
      createCalled = true;
    });

    cy.visit("/admin/grades");
    cy.get('select[name="enrollment_id"]').select("10");
    cy.get('input[name="value"]').first().clear().type("150");
    cy.contains("button", "Registrar").click();

    cy.then(() => {
      expect(createCalled).to.equal(false);
    });
  });
});
