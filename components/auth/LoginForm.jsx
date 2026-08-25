"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const emailInput = form.elements.email;
    const email = emailInput.value.trim().toLowerCase();

    if (!email.endsWith("@gmail.com")) {
      emailInput.setCustomValidity("Faqat @gmail.com manzilidan foydalaning.");
      emailInput.reportValidity();
      return;
    }

    emailInput.setCustomValidity("");
    setStatus("Kirish muvaffaqiyatli. Dashboard ochilmoqda…");
    router.push("/dashboard");
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-field">
        <label htmlFor="email">Gmail manzili</label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="name@gmail.com"
          pattern="[A-Za-z0-9._%+\-]+@gmail\.com"
          title="Faqat @gmail.com manzilini kiriting"
          onChange={(event) => event.currentTarget.setCustomValidity("")}
          onInvalid={(event) => {
            const input = event.currentTarget;
            input.setCustomValidity(
              input.validity.valueMissing
                ? "Gmail manzilingizni kiriting."
                : "Faqat @gmail.com manzilidan foydalaning.",
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

      <button className="button button--dark login-submit" type="submit">
        Kirish
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
