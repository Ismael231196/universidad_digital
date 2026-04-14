import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { AccessDeniedPage } from "../pages/AccessDeniedPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ServerErrorPage } from "../pages/ServerErrorPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { UsersPage } from "../pages/admin/UsersPage";
import { SubjectsPage } from "../pages/admin/SubjectsPage";
import { PeriodsPage } from "../pages/admin/PeriodsPage";
import { EnrollmentsPage } from "../pages/admin/EnrollmentsPage";
import { GradesPage } from "../pages/admin/GradesPage";
import { StudentDashboard } from "../pages/student/StudentDashboard";
import { StudentSubjectsPage } from "../pages/student/StudentSubjectsPage";
import { StudentEnrollmentsPage } from "../pages/student/StudentEnrollmentsPage";
import { StudentGradesPage } from "../pages/student/StudentGradesPage";
import { TeacherDashboard } from "../pages/teacher/TeacherDashboard";
import { TeacherGradesPage } from "../pages/teacher/TeacherGradesPage";
import { useAuth } from "../hooks/useAuth";

function HomeRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div className="card">Cargando...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.roles.includes("Administrador")) {
    return <Navigate to="/admin" replace />;
  }
  if (user.roles.includes("Docente")) {
    return <Navigate to="/teacher" replace />;
  }
  return <Navigate to="/student" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/denied" element={<AccessDeniedPage />} />
      <Route path="/500" element={<ServerErrorPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["Administrador"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={["Administrador"]}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subjects"
        element={
          <ProtectedRoute roles={["Administrador"]}>
            <SubjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/periods"
        element={
          <ProtectedRoute roles={["Administrador"]}>
            <PeriodsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/enrollments"
        element={
          <ProtectedRoute roles={["Administrador"]}>
            <EnrollmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grades"
        element={
          <ProtectedRoute roles={["Administrador"]}>
            <GradesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student"
        element={
          <ProtectedRoute roles={["Estudiante"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/subjects"
        element={
          <ProtectedRoute roles={["Estudiante"]}>
            <StudentSubjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/enrollments"
        element={
          <ProtectedRoute roles={["Estudiante"]}>
            <StudentEnrollmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/grades"
        element={
          <ProtectedRoute roles={["Estudiante"]}>
            <StudentGradesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher"
        element={
          <ProtectedRoute roles={["Docente"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/grades"
        element={
          <ProtectedRoute roles={["Docente"]}>
            <TeacherGradesPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
