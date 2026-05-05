"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm({
  labels,
}: {
  labels: {
    email: string;
    password: string;
    signIn: string;
    signingIn: string;
    invalidLogin: string;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(searchParams.get("error") ? labels.invalidLogin : "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
      callbackUrl: "/dashboard/posts",
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError(labels.invalidLogin);
      return;
    }

    router.push(result?.url ?? "/dashboard/posts");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <label>
        <span>{labels.email}</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        <span>{labels.password}</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? labels.signingIn : labels.signIn}
      </button>
    </form>
  );
}
