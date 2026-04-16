import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Table } from "../../components/Table";
import { Alert } from "../../components/Alert";
import { periodsService } from "../../services/periodsService";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/apiError";
import type { PeriodResponse } from "../../api/periods";

const createSchema = z.object({
  code: z.string().min(2, { message: "El código debe tener al menos 2 caracteres." }),
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  start_date: z.string().min(8, { message: "La fecha de inicio debe tener formato YYYY-MM-DD (8 caracteres)." }),
  end_date: z.string().min(8, { message: "La fecha de fin debe tener formato YYYY-MM-DD (8 caracteres)." })
});

const updateSchema = z.object({
  id: z.string().min(1, { message: "El ID es obligatorio." }),
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }).optional(),
  start_date: z.string().min(8, { message: "La fecha de inicio debe tener formato YYYY-MM-DD (8 caracteres)." }).optional(),
  end_date: z.string().min(8, { message: "La fecha de fin debe tener formato YYYY-MM-DD (8 caracteres)." }).optional()
});

type CreateForm = z.infer<typeof createSchema>;
type UpdateForm = z.infer<typeof updateSchema>;

export function PeriodsPage() {
  const [alert, setAlert] = useState<{ message: string; variant: "success" | "error" } | null>(
    null
  );
  const { data: periods, error, isLoading, reload } = useFetch(periodsService.list, []);

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const updateForm = useForm<UpdateForm>({ resolver: zodResolver(updateSchema) });
  const [editing, setEditing] = useState<PeriodResponse | null>(null);

  const handleEdit = (period: PeriodResponse) => {
    updateForm.setValue("id", String(period.id));
    updateForm.setValue("name", period.name);
    updateForm.setValue("start_date", period.start_date);
    updateForm.setValue("end_date", period.end_date);
    setEditing(period);
  };

  const handleCreate = async (values: CreateForm) => {
    try {
      await periodsService.create(values);
      setAlert({ message: "Periodo creado.", variant: "success" });
      createForm.reset();
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  const handleUpdate = async (values: UpdateForm) => {
    try {
      await periodsService.update(Number(values.id), {
        name: values.name || undefined,
        start_date: values.start_date || undefined,
        end_date: values.end_date || undefined
      });
      setAlert({ message: "Periodo actualizado.", variant: "success" });
      updateForm.reset();
      setEditing(null);
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await periodsService.update(id, { is_active: !isActive });
      setAlert({ message: isActive ? "Periodo desactivado." : "Periodo activado.", variant: "success" });
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), variant: "error" });
    }
  };

  return (
    <DashboardLayout>
      <div className="grid grid-2">
        <div className="card">
          <h2>Crear periodo</h2>
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
              label="Fecha inicio (YYYY-MM-DD)"
              {...createForm.register("start_date")}
              error={createForm.formState.errors.start_date?.message}
            />
            <Input
              label="Fecha fin (YYYY-MM-DD)"
              {...createForm.register("end_date")}
              error={createForm.formState.errors.end_date?.message}
            />
            <Button type="submit">Crear</Button>
          </form>
        </div>
        {editing && (
          <div className="card">
            <h2>Actualizar periodo</h2>
            <form onSubmit={updateForm.handleSubmit(handleUpdate)} className="grid">
              <Input
                label="ID de periodo"
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
                label="Fecha inicio (opcional)"
                {...updateForm.register("start_date")}
                error={updateForm.formState.errors.start_date?.message}
              />
              <Input
                label="Fecha fin (opcional)"
                {...updateForm.register("end_date")}
                error={updateForm.formState.errors.end_date?.message}
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
        <h2>Listado de periodos</h2>
        {error ? <Alert message={error} /> : null}
        {isLoading ? (
          <p>Cargando...</p>
        ) : !(periods?.length ?? 0) ? (
          <p>No hay periodos activos para mostrar.</p>
        ) : (
          <Table<PeriodResponse>
            caption="Listado de periodos"
            data={periods ?? []}
            columns={[
              { header: "ID", render: (row) => row.id },
              { header: "Código", render: (row) => row.code },
              { header: "Nombre", render: (row) => row.name },
              { header: "Inicio", render: (row) => row.start_date },
              { header: "Fin", render: (row) => row.end_date },
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
