import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "../layouts/AuthLayout";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { forgotPassword } from "../api/auth";
import { sanitizeText } from "../utils/sanitize";

const schema = z.object({
  email: z.string().email("Ingresa un email válido."),
});

type ForgotPasswordForm = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: ForgotPasswordForm) => {
    setError(null);
    try {
      await forgotPassword(sanitizeText(values.email));
      setSent(true);
    } catch {
      setError("Ocurrió un error. Intenta de nuevo más tarde.");
    }
  };

  return (
    <AuthLayout>
      <div className="login-logo">
        <span style={{ fontSize: 28 }}>🎓</span>
        <span className="login-logo-text">Universidad Digital</span>
      </div>
      <h1>Recuperar contraseña</h1>
      <p className="login-subtitle">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      {sent ? (
        <div className="alert" role="status">
          Si el correo está registrado, recibirás un enlace en tu bandeja de entrada.
        </div>
      ) : (
        <>
          {error ? <Alert message={error} /> : null}
          <form onSubmit={handleSubmit(onSubmit)} className="grid">
            <Input
              label="Correo electrónico"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar enlace"}
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
