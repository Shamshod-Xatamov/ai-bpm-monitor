import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export const metadata = {
  title: "Kirish — AI-BPM Monitor",
  description: "AI-BPM Monitor boshqaruv markaziga kirish.",
};

export default function LoginPage() {
  return (
    <main className="login-page">
      <header className="login-header">
        <Link
          className="brand login-brand"
          href="/"
          aria-label="Bosh sahifaga qaytish"
        >
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 42 42" fill="none">
              <path d="M12 11.5h12.5A6.5 6.5 0 0 1 31 18v12.5" />
              <path d="M30 30.5H17.5A6.5 6.5 0 0 1 11 24V11.5" />
              <circle cx="11" cy="11.5" r="3" />
              <circle cx="31" cy="30.5" r="3" />
              <path d="m16.5 21 3 3 6-7" />
            </svg>
          </span>
          <span className="brand-copy">
            <strong>AI-BPM</strong>
            <span>Monitor</span>
          </span>
        </Link>

        <Link className="login-back" href="/">
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <path d="M14.25 9H3.75M8 4.75 3.75 9 8 13.25" />
          </svg>
          Bosh sahifa
        </Link>
      </header>

      <section className="login-stage" aria-labelledby="login-title">
        <div className="login-card">
          <span className="login-kicker">Xavfsiz kirish</span>
          <h1 id="login-title">Hisobingizga kiring</h1>
          <p>
            AI-BPM boshqaruv markaziga davom etish uchun Gmail manzilingiz va
            parolingizni kiriting.
          </p>

          <LoginForm />
        </div>
      </section>
    </main>
  );
}
