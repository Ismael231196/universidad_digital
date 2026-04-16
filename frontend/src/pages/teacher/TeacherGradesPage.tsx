import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Table } from "../../components/Table";
import { Alert } from "../../components/Alert";
import { gradesService } from "../../services/gradesService";
import { enrollmentsService } from "../../services/enrollmentsService";
import { usersService } from "../../services/usersService";
import { subjectsService } from "../../services/subjectsService";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/apiError";
import type { GradeResponse } from "../../api/grades";

const createSchema = z.object({
  user_id: z.string().min(1, "Selecciona un estudiante."),
  subject_id: z.string().min(1, "Selecciona una materia."),
  value: z.coerce.number().min(0, "La nota debe ser mayor o igual a 0.").max(100, "La nota debe ser menor o igual a 100."),
  notes: z.string().optional()
});

const updateSchema = z.object({
  id: z.string().min(1),
  value: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional()
});

type CreateForm = z.infer<typeof createSchema>;
type UpdateForm = z.infer<typeof updateSchema>;

export function TeacherGradesPage() {
  const [alert, setAlert] = useState<{ message: string; variant: "success" | "error" } | null>(
    null
  );
  const { data: grades, error, isLoading, reload } = useFetch(gradesService.list, []);
  const { data: enrollments } = useFetch(enrollmentsService.list, []);
  const { data: users } = useFetch(usersService.list, []);
  const { data: subjects } = useFetch(subjectsService.list, []);

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const updateForm = useForm<UpdateForm>({ resolver: zodResolver(updateSchema) });

  const userOptions =
    users?.filter(u => u.roles.includes("Estudiante") && u.is_active)
      .map((user) => ({ value: String(user.id), label: user.full_name })) ?? [];
  const subjectOptions =
    subjects?.filter(s => s.is_active)
      .map((subject) => ({ value: String(subject.id), label: subject.name })) ?? [];
  const hasGrades = (grades?.length ?? 0) > 0;

  const handleCreate = async (values: CreateForm) => {
    setDuplicateError(null);
    // Validación frontend: no permitir duplicados
    const alreadyExists = (grades ?? []).some(
      (g) => String(g.student_full_name) === users?.find(u => String(u.id) === values.user_id)?.full_name &&
              String(g.subject_name) === subjects?.find(s => String(s.id) === values.subject_id)?.name
    );
    if (alreadyExists) {
      setDuplicateError("Ya existe una calificación para este estudiante y materia.");
      return;
    }
    // Buscar la inscripción correspondiente
    const enrollment = (enrollments ?? []).find(
      (e) => String(e.user_id) === values.user_id && String(e.subject_id) === values.subject_id && e.is_active
    );
    if (!enrollment) {
      setDuplicateError("No existe una inscripción activa para este estudiante y materia. Primero debe inscribir al estudiante en la materia.");
      return;
    }
    try {
      await gradesService.create({
        enrollment_id: enrollment.id,
        value: Number(values.value),
        notes: values.notes ?? null
      });
      setAlert({ message: "Calificación registrada.", variant: "success" });
      createForm.reset();
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  const handleUpdate = async (values: UpdateForm) => {
    try {
      await gradesService.update(Number(values.id), {
        value: values.value ?? undefined,
        notes: values.notes ?? undefined
      });
      setAlert({ message: "Calificación actualizada.", variant: "success" });
      updateForm.reset();
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  // Manejar edición desde la tabla
  const handleEdit = (row: GradeResponse) => {
    updateForm.reset({
      id: String(row.id),
      value: row.value,
      notes: row.notes ?? ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <DashboardLayout>
      <div className="grid grid-2">
        <div className="card">
          <h2>Registrar calificación</h2>
          {alert ? <Alert message={alert.message} variant={alert.variant} /> : null}
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="grid">
            {duplicateError && <Alert message={duplicateError} variant="error" />}
            <Select
              label="Estudiante"
              options={[{ value: "", label: "Selecciona un estudiante" }, ...userOptions]}
              {...createForm.register("user_id")}
              error={createForm.formState.errors.user_id?.message}
            />
            <Select
              label="Materia"
              options={[{ value: "", label: "Selecciona una materia" }, ...subjectOptions]}
              {...createForm.register("subject_id")}
              error={createForm.formState.errors.subject_id?.message}
            />
            <Input
              label="Nota"
              type="number"
              step="0.01"
              {...createForm.register("value")}
              error={createForm.formState.errors.value?.message}
            />
            <Input
              label="Notas (opcional)"
              {...createForm.register("notes")}
              error={createForm.formState.errors.notes?.message}
            />
            <Button type="submit">Registrar</Button>
          </form>
        </div>
        <div className="card">
          <h2>Actualizar calificación</h2>
          <form onSubmit={updateForm.handleSubmit(handleUpdate)} className="grid">
            <Input
              label="ID de calificación"
              {...updateForm.register("id")}
              error={updateForm.formState.errors.id?.message}
            />
            <Input
              label="Nota (opcional)"
              type="number"
              step="0.01"
              {...updateForm.register("value")}
              error={updateForm.formState.errors.value?.message}
            />
            <Input
              label="Notas (opcional)"
              {...updateForm.register("notes")}
              error={updateForm.formState.errors.notes?.message}
            />
            <Button type="submit" variant="secondary">
              Actualizar
            </Button>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Listado de calificaciones</h2>
        {error ? <Alert message={error} /> : null}
        {isLoading ? (
          <p>Cargando...</p>
        ) : !hasGrades ? (
          <p>No hay calificaciones registradas.</p>
        ) : (
          <Table<GradeResponse>
            caption="Listado de calificaciones"
            data={grades ?? []}
            columns={[
              { header: "ID", render: (row) => row.id },
              { header: "Estudiante", render: (row) => row.student_full_name ?? "-" },
              { header: "Materia", render: (row) => row.subject_name ?? "-" },
              { header: "Profesor", render: (row) => row.teacher_full_name ?? "-" },
              { header: "Nota", render: (row) => row.value },
              { header: "Notas", render: (row) => row.notes ?? "-" },
              {
                header: "Editar",
                render: (row) => (
                  <Button type="button" variant="secondary" onClick={() => handleEdit(row)}>
                    Editar
                  </Button>
                )
              }
            ]}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
