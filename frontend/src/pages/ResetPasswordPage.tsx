import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "../layouts/AuthLayout";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { resetPassword } from "../api/auth";

const schema = z
  .object({
    new_password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Las contraseñas no coinciden.",
    path: ["confirm_password"],
  });

type ResetPasswordForm = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: ResetPasswordForm) => {
    setError(null);
    if (!token) {
      setError("El enlace es inválido o ha expirado.");
      return;
    }
    try {
      await resetPassword(token, values.new_password);
      setDone(true);
    } catch {
      setError("El enlace es inválido o ha expirado. Solicita uno nuevo.");
    }
  };

  return (
    <AuthLayout>
      <div className="login-logo">
        <span style={{ fontSize: 28 }}>🎓</span>
        <span className="login-logo-text">Universidad Digital</span>
      </div>
      <h1>Nueva contraseña</h1>
      <p className="login-subtitle">Crea una nueva contraseña para tu cuenta.</p>

      {done ? (
        <div className="alert" role="status">
          ¡Contraseña actualizada correctamente!{" "}
          <Link to="/login">Inicia sesión aquí.</Link>
        </div>
      ) : (
        <>
          {error ? <Alert message={error} /> : null}
          <form onSubmit={handleSubmit(onSubmit)} className="grid">
            <Input
              label="Nueva contraseña"
              type="password"
              {...register("new_password")}
              error={errors.new_password?.message}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              {...register("confirm_password")}
              error={errors.confirm_password?.message}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar contraseña"}
            </Button>
          </form>
        </>
      )}

      <p style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.875rem" }}>
        <Link to="/login">← Volver al inicio de sesión</Link>
      </p>
    </AuthLayout>
  );
}
