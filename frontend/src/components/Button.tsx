import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
};

export function Button({
  variant = "primary",
  className = "",
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "secondary" ? "secondary" : variant === "danger" ? "danger" : "";
  return (
    <button
      className={`button ${variantClass} ${className}`.trim()}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    />
  );
}
