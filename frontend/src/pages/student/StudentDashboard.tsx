import { Link } from "react-router-dom";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { StudentIllustration } from "../../components/illustrations/StudentIllustration";
import { useAuth } from "../../hooks/useAuth";

export function StudentDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="welcome-card" style={{ background: "linear-gradient(135deg, #d97706 0%, #92400e 100%)" }}>
        <div className="welcome-card-content">
          <h1 className="welcome-card-title">
            ¡Bienvenido, {user?.full_name ?? "Estudiante"}! 🎒
          </h1>
          <p className="welcome-card-subtitle">
            Consulta tus materias disponibles, gestiona tus inscripciones y revisa tus calificaciones.
          </p>
        </div>
        <div className="welcome-card-illustration">
          <StudentIllustration style={{ width: 180, height: 150 }} />
        </div>
      </div>

      <div className="page-header">
        <h2 className="page-title">Tu espacio académico</h2>
        <p className="page-subtitle">Todo lo que necesitas en un solo lugar</p>
      </div>

      <div className="feature-grid">
        <Link to="/student/subjects" className="feature-card">
          <div className="feature-card-icon">📚</div>
          <div className="feature-card-title">Materias</div>
          <p className="feature-card-desc">Explora el catálogo de materias disponibles</p>
        </Link>
        <Link to="/student/enrollments" className="feature-card">
          <div className="feature-card-icon">📋</div>
          <div className="feature-card-title">Inscripciones</div>
          <p className="feature-card-desc">Gestiona tus inscripciones a materias</p>
        </Link>
        <Link to="/student/grades" className="feature-card">
          <div className="feature-card-icon">📊</div>
          <div className="feature-card-title">Calificaciones</div>
          <p className="feature-card-desc">Consulta tus calificaciones y progreso</p>
        </Link>
      </div>
    </DashboardLayout>
  );
}
