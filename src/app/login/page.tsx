import { Suspense } from "react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section>
        <p className="eyebrow">Blog Publisher</p>
        <h1>Sign in</h1>
        <p>Manage Word imports, review posts, and export your static blog.</p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
