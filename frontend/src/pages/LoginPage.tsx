import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "../layouts/AuthLayout";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { useAuth } from "../hooks/useAuth";
import { sanitizeText } from "../utils/sanitize";

const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.")
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (values: LoginForm) => {
    const email = sanitizeText(values.email);
    const password = sanitizeText(values.password);
    await login(email, password);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout>
      <div className="login-logo">
        <span style={{ fontSize: 28 }}>🎓</span>
        <span className="login-logo-text">Universidad Digital</span>
      </div>
      <h1>Iniciar sesión</h1>
      <p className="login-subtitle">Accede a tu portal académico</p>
      {error ? <Alert message={error} /> : null}
      <form onSubmit={handleSubmit(onSubmit)} className="grid">
        <Input
          label="Correo electrónico"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          label="Contraseña"
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <p style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.875rem" }}>
        <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
      </p>
    </AuthLayout>
  );
}
