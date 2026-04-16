import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Table } from "../../components/Table";
import { Alert } from "../../components/Alert";
import { subjectsService } from "../../services/subjectsService";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/apiError";
import type { SubjectResponse } from "../../api/subjects";

const createSchema = z.object({
  code: z.string().min(2, { message: "El código debe tener al menos 2 caracteres." }),
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  credits: z.coerce.number().min(1, { message: "Los créditos deben ser mínimo 1." }).max(30, { message: "Los créditos deben ser máximo 30." })
});

const updateSchema = z.object({
  id: z.string().min(1, { message: "El ID es obligatorio." }),
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }).optional(),
  credits: z.coerce.number().min(1, { message: "Los créditos deben ser mínimo 1." }).max(30, { message: "Los créditos deben ser máximo 30." }).optional()
});

type CreateForm = z.infer<typeof createSchema>;
type UpdateForm = z.infer<typeof updateSchema>;

export function SubjectsPage() {
  const [alert, setAlert] = useState<{ message: string; variant: "success" | "error" } | null>(
    null
  );
  const { data: subjects, error, isLoading, reload } = useFetch(subjectsService.list, []);

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const updateForm = useForm<UpdateForm>({ resolver: zodResolver(updateSchema) });
  const [editing, setEditing] = useState<SubjectResponse | null>(null);

  const handleEdit = (subject: SubjectResponse) => {
    updateForm.setValue("id", String(subject.id));
    updateForm.setValue("name", subject.name);
    updateForm.setValue("credits", subject.credits);
    setEditing(subject);
  };

  const handleCreate = async (values: CreateForm) => {
    try {
      await subjectsService.create(values);
      setAlert({ message: "Materia creada.", variant: "success" });
      createForm.reset();
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  const handleUpdate = async (values: UpdateForm) => {
    try {
      await subjectsService.update(Number(values.id), {
        name: values.name || undefined,
        credits: values.credits || undefined
      });
      setAlert({ message: "Materia actualizada.", variant: "success" });
      updateForm.reset();
      setEditing(null);
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await subjectsService.update(id, { is_active: !isActive });
      setAlert({ message: isActive ? "Materia desactivada." : "Materia activada.", variant: "success" });
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  return (
    <DashboardLayout>
      <div className="grid grid-2">
        <div className="card">
          <h2>Crear materia</h2>
          {alert ? <Alert message={alert.message} variant={alert.variant} /> : null}
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="grid">
            <Input
              label="Código"
              {...createForm.register("code")}
              error={createForm.formState.errors.code?.message}
            />
            <Input
              label="Nombre"
              {...createForm.register("name")}
              error={createForm.formState.errors.name?.message}
            />
            <Input
              label="Créditos"
              type="number"
              {...createForm.register("credits")}
              error={createForm.formState.errors.credits?.message}
            />
            <Button type="submit">Crear</Button>
          </form>
        </div>
        {editing && (
          <div className="card">
            <h2>Actualizar materia</h2>
            <form onSubmit={updateForm.handleSubmit(handleUpdate)} className="grid">
              <Input
                label="ID de materia"
                {...updateForm.register("id")}
                error={updateForm.formState.errors.id?.message}
                disabled
              />
              <Input
                label="Nombre (opcional)"
                {...updateForm.register("name")}
                error={updateForm.formState.errors.name?.message}
              />
              <Input
                label="Créditos (opcional)"
                type="number"
                {...updateForm.register("credits")}
                error={updateForm.formState.errors.credits?.message}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <Button type="submit" variant="secondary">
                  Actualizar
                </Button>
                <Button type="button" variant="secondary" onClick={() => { setEditing(null); updateForm.reset(); }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Listado de materias</h2>
        {error ? <Alert message={error} /> : null}
        {isLoading ? (
          <p>Cargando...</p>
        ) : !(subjects?.length ?? 0) ? (
          <p>No hay materias activas para mostrar.</p>
        ) : (
          <Table<SubjectResponse>
            caption="Listado de materias"
            data={subjects ?? []}
            columns={[
              { header: "ID", render: (row) => row.id },
              { header: "Código", render: (row) => row.code },
              { header: "Nombre", render: (row) => row.name },
              { header: "Créditos", render: (row) => row.credits },
              { header: "Activo", render: (row) => (row.is_active ? "Sí" : "No") },
              {
                header: "Acciones",
                render: (row) => (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      variant={row.is_active ? "danger" : "secondary"}
                      onClick={() => handleToggleActive(row.id, row.is_active)}
                    >
                      {row.is_active ? "Desactivar" : "Activar"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(row)}
                    >
                      Editar
                    </Button>
                  </div>
                )
              }
            ]}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
