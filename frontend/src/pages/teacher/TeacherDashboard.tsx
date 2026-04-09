import { Link } from "react-router-dom";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { TeacherIllustration } from "../../components/illustrations/TeacherIllustration";
import { useAuth } from "../../hooks/useAuth";

export function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="welcome-card" style={{ background: "linear-gradient(135deg, #059669 0%, #065f46 100%)" }}>
        <div className="welcome-card-content">
          <h1 className="welcome-card-title">
            ¡Bienvenido, {user?.full_name ?? "Docente"}! 🎓
          </h1>
          <p className="welcome-card-subtitle">
            Gestiona las calificaciones de tus estudiantes inscritos en tus materias.
          </p>
        </div>
        <div className="welcome-card-illustration">
          <TeacherIllustration style={{ width: 180, height: 150 }} />
        </div>
      </div>

      <div className="page-header">
        <h2 className="page-title">Tu espacio docente</h2>
        <p className="page-subtitle">Accede a las herramientas disponibles para ti</p>
      </div>

      <div className="feature-grid">
        <Link to="/teacher/grades" className="feature-card">
          <div className="feature-card-icon">📊</div>
          <div className="feature-card-title">Calificaciones</div>
          <p className="feature-card-desc">Registra y actualiza las calificaciones de tus estudiantes</p>
        </Link>
      </div>
    </DashboardLayout>
  );
}
