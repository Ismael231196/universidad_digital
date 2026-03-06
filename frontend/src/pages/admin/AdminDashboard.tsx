import { DashboardLayout } from "../../layouts/DashboardLayout";

export function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="card">
        <h1>Panel Administrador</h1>
        <p>Gestiona usuarios, materias, periodos, inscripciones y calificaciones.</p>
      </div>
    </DashboardLayout>
  );
}
