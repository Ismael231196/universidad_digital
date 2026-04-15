import { Link } from "react-router-dom";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { AdminIllustration } from "../../components/illustrations/AdminIllustration";
import { useAuth } from "../../hooks/useAuth";

export function AdminDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="welcome-card">
        <div className="welcome-card-content">
          <h1 className="welcome-card-title">
            ¡Bienvenida, {user?.full_name ?? "Administrador"}! 👋
          </h1>
          <p className="welcome-card-subtitle">
            Desde aquí puedes gestionar usuarios, materias, periodos, inscripciones y calificaciones de la plataforma.
          </p>
        </div>
        <div className="welcome-card-illustration">
          <AdminIllustration style={{ width: 180, height: 150 }} />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-label">Usuarios</div>
          <div className="stat-card-value">—</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📚</div>
          <div className="stat-card-label">Materias</div>
          <div className="stat-card-value">—</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📋</div>
          <div className="stat-card-label">Inscripciones</div>
          <div className="stat-card-value">—</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📊</div>
          <div className="stat-card-label">Calificaciones</div>
          <div className="stat-card-value">—</div>
        </div>
      </div>

      <div className="page-header">
        <h2 className="page-title">Panel Administrador</h2>
        <p className="page-subtitle">Navega a las secciones principales</p>
      </div>

      <div className="feature-grid">
        <Link to="/admin/users" className="feature-card">
          <div className="feature-card-icon">👥</div>
          <div className="feature-card-title">Usuarios</div>
          <p className="feature-card-desc">Gestiona cuentas y roles de usuarios</p>
        </Link>
        <Link to="/admin/subjects" className="feature-card">
          <div className="feature-card-icon">📚</div>
          <div className="feature-card-title">Materias</div>
          <p className="feature-card-desc">Administra el catálogo de materias</p>
        </Link>
        <Link to="/admin/periods" className="feature-card">
          <div className="feature-card-icon">📅</div>
          <div className="feature-card-title">Periodos</div>
          <p className="feature-card-desc">Configura periodos académicos</p>
        </Link>
        <Link to="/admin/enrollments" className="feature-card">
          <div className="feature-card-icon">📋</div>
          <div className="feature-card-title">Inscripciones</div>
          <p className="feature-card-desc">Gestiona inscripciones de estudiantes</p>
        </Link>
        <Link to="/admin/grades" className="feature-card">
          <div className="feature-card-icon">📊</div>
          <div className="feature-card-title">Calificaciones</div>
          <p className="feature-card-desc">Consulta y gestiona calificaciones</p>
        </Link>
      </div>
    </DashboardLayout>
  );
}
