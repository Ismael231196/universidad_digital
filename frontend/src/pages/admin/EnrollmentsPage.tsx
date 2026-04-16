import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Button } from "../../components/Button";
import { Select } from "../../components/Select";
import { Table } from "../../components/Table";
import { Alert } from "../../components/Alert";
import { enrollmentsService } from "../../services/enrollmentsService";
import { usersService } from "../../services/usersService";
import { subjectsService } from "../../services/subjectsService";
import { periodsService } from "../../services/periodsService";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/apiError";
import type { EnrollmentResponse } from "../../api/enrollments";


const createSchema = z.object({
  user_id: z.string().min(1, "Selecciona un estudiante"),
  subject_id: z.string().min(1, "Selecciona una materia"),
  period_id: z.string().min(1, "Selecciona un periodo")
});
const updateSchema = z.object({
  id: z.string().min(1, "ID requerido"),
  user_id: z.string().min(1, "Selecciona un estudiante"),
  subject_id: z.string().min(1, "Selecciona una materia"),
  period_id: z.string().min(1, "Selecciona un periodo")
});
type CreateForm = z.infer<typeof createSchema>;
type UpdateForm = z.infer<typeof updateSchema>;

export function EnrollmentsPage() {
  const [alert, setAlert] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const [editData, setEditData] = useState<EnrollmentResponse | null>(null);
  const { data: enrollments, error, isLoading, reload } = useFetch(enrollmentsService.list, []);
  const { data: users } = useFetch(usersService.list, []);
  const { data: subjects } = useFetch(subjectsService.list, []);
  const { data: periods } = useFetch(periodsService.list, []);

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const updateForm = useForm<UpdateForm>({ resolver: zodResolver(updateSchema) });

  const userOptions =
    users?.map((user) => ({ value: String(user.id), label: `${user.full_name} (#${user.id})` })) ?? [];
  const subjectOptions =
    subjects?.map((subject) => ({
      value: String(subject.id),
      label: `${subject.name} (#${subject.id})`
    })) ?? [];
  const periodOptions =
    periods?.map((period) => ({
      value: String(period.id),
      label: `${period.name} (#${period.id})`
    })) ?? [];
  const hasEnrollments = (enrollments?.length ?? 0) > 0;

  const handleCreate = async (values: CreateForm) => {
    try {
      await enrollmentsService.create({
        user_id: Number(values.user_id),
        subject_id: Number(values.subject_id),
        period_id: Number(values.period_id)
      });
      setAlert({ message: "Inscripción creada.", variant: "success" });
      createForm.reset();
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  const handleEditClick = (row: EnrollmentResponse) => {
    setEditData(row);
    updateForm.reset({
      id: String(row.id),
      user_id: String(row.user_id),
      subject_id: String(row.subject_id),
      period_id: String(row.period_id)
    });
  };

  const handleUpdate = async (values: UpdateForm) => {
    try {
      await enrollmentsService.update(Number(values.id), {
        user_id: Number(values.user_id),
        subject_id: Number(values.subject_id),
        period_id: Number(values.period_id)
      });
      setAlert({ message: "Inscripción actualizada.", variant: "success" });
      setEditData(null);
      updateForm.reset();
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await enrollmentsService.update(id, { is_active: !isActive });
      setAlert({ message: isActive ? "Inscripción desactivada." : "Inscripción activada.", variant: "success" });
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  return (
    <DashboardLayout>
      <div className="card">
        <h2>Crear inscripción</h2>
        {alert ? <Alert message={alert.message} variant={alert.variant} /> : null}
        <form onSubmit={createForm.handleSubmit(handleCreate)} className="grid">
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
          <Select
            label="Periodo"
            options={[{ value: "", label: "Selecciona un periodo" }, ...periodOptions]}
            {...createForm.register("period_id")}
            error={createForm.formState.errors.period_id?.message}
          />
          <Button type="submit">Crear</Button>
        </form>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Listado de inscripciones</h2>
        {error ? <Alert message={error} /> : null}
        {isLoading ? (
          <p>Cargando...</p>
        ) : !hasEnrollments ? (
          <p>No hay inscripciones activas para mostrar.</p>
        ) : (
          <Table<EnrollmentResponse>
            caption="Listado de inscripciones"
            data={enrollments ?? []}
            columns={[
              { header: "ID", render: (row) => row.id },
              {
                header: "Estudiante",
                render: (row) => row.user_full_name ?? `Usuario #${row.user_id}`
              },
              {
                header: "Materia",
                render: (row) => row.subject_name ?? `Materia #${row.subject_id}`
              },
              {
                header: "Periodo",
                render: (row) => row.period_name ?? `Periodo #${row.period_id}`
              },
              { header: "Activo", render: (row) => (row.is_active ? "Sí" : "No") },
              {
                header: "Acciones",
                render: (row) => (
                  <>
                    <Button variant="secondary" style={{ marginRight: 8 }} onClick={() => handleEditClick(row)}>
                      Editar
                    </Button>
                    <Button
                      variant={row.is_active ? "danger" : "secondary"}
                      onClick={() => handleToggleActive(row.id, row.is_active)}
                    >
                      {row.is_active ? "Desactivar" : "Activar"}
                    </Button>
                  </>
                )
              }
            ]}
          />
        )}
      </div>

      {editData && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2>Editar inscripción</h2>
          <form onSubmit={updateForm.handleSubmit(handleUpdate)} className="grid">
            <input type="hidden" {...updateForm.register("id")} />
            <Select
              label="Estudiante"
              options={[{ value: "", label: "Selecciona un estudiante" }, ...userOptions]}
              {...updateForm.register("user_id")}
              error={updateForm.formState.errors.user_id?.message}
            />
            <Select
              label="Materia"
              options={[{ value: "", label: "Selecciona una materia" }, ...subjectOptions]}
              {...updateForm.register("subject_id")}
              error={updateForm.formState.errors.subject_id?.message}
            />
            <Select
              label="Periodo"
              options={[{ value: "", label: "Selecciona un periodo" }, ...periodOptions]}
              {...updateForm.register("period_id")}
              error={updateForm.formState.errors.period_id?.message}
            />
            <Button type="submit">Guardar cambios</Button>
            <Button type="button" variant="secondary" onClick={() => setEditData(null)}>
              Cancelar edición
            </Button>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
