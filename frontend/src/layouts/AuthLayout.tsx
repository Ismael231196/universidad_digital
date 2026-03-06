import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 420, margin: "60px auto" }}>
        {children}
      </div>
    </main>
  );
}
