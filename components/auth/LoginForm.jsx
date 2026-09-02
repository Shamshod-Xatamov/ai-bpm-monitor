"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error?.message ?? "Kirish amalga oshmadi.");
      }
      setStatus("Kirish muvaffaqiyatli. Dashboard ochilmoqda…");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Kirish amalga oshmadi.",
      );
      setBusy(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-field">
        <label htmlFor="email">Email manzili</label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="analitik@tashkilot.uz"
          onChange={(event) => event.currentTarget.setCustomValidity("")}
          onInvalid={(event) => {
            const input = event.currentTarget;
            input.setCustomValidity(
              input.validity.valueMissing
                ? "Email manzilingizni kiriting."
                : "To‘g‘ri email manzilini kiriting.",
            );
          }}
          required
        />
      </div>

      <div className="login-field">
        <label htmlFor="password">Parol</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Parolingizni kiriting"
          onChange={(event) => event.currentTarget.setCustomValidity("")}
          onInvalid={(event) =>
            event.currentTarget.setCustomValidity("Parolingizni kiriting.")
          }
          required
        />
      </div>

      <button
        className="button button--dark login-submit"
        type="submit"
        disabled={busy}
      >
        {busy ? "Tekshirilmoqda…" : "Kirish"}
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <path d="M3.75 9h10.5M10 4.75 14.25 9 10 13.25" />
        </svg>
      </button>

      <p className="login-status" role="status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
