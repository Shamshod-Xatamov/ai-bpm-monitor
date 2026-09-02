"use client";

import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import styles from "./UsersManagement.module.css";

const roleLabels = {
  ADMIN: "Admin",
  ANALYST: "Analitik",
  VIEWER: "Kuzatuvchi",
};

async function api(path, options) {
  const response = await fetch(path, { cache: "no-store", ...options });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error?.message ?? "Server bilan aloqa xatosi.");
  }
  return body;
}

function initials(name) {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value) {
  if (!value) return "Hali kirmagan";
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function UsersManagement({ currentUser }) {
  const [data, setData] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setData(await api("/api/users"));
  }, []);

  useEffect(() => {
    if (currentUser?.role !== "ADMIN") return;
    let cancelled = false;
    api("/api/users").then(
      (result) => {
        if (!cancelled) setData(result);
      },
      (reason) => {
        if (!cancelled) setError(reason.message);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [currentUser?.role, load]);

  if (currentUser?.role !== "ADMIN") {
    return (
      <section className={styles.denied}>
        <Icon name="users" size={26} />
        <h1>Ruxsat yetarli emas</h1>
        <p>Foydalanuvchilarni faqat tashkilot admini boshqara oladi.</p>
      </section>
    );
  }

  const createUser = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setBusyId("create");
    setError("");
    setMessage("");
    try {
      await api("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
          role: formData.get("role"),
        }),
      });
      form.reset();
      setCreateOpen(false);
      setMessage("Yangi foydalanuvchi yaratildi.");
      await load();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusyId(null);
    }
  };

  const updateUser = async (userId, payload, successMessage) => {
    setBusyId(userId);
    setError("");
    setMessage("");
    try {
      await api(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMessage(successMessage);
      setResetUserId(null);
      await load();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusyId(null);
    }
  };

  const resetPassword = (event, userId) => {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    updateUser(
      userId,
      { password },
      "Parol yangilandi va eski sessionlar yopildi.",
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroIcon}>
          <Icon name="users" size={24} />
        </div>
        <div>
          <span className={styles.eyebrow}>Kirish boshqaruvi</span>
          <h1>Foydalanuvchilar</h1>
          <p>
            Jamoa a’zolari, rollar va platformaga kirish holatini boshqaring.
          </p>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => setCreateOpen((current) => !current)}
        >
          <Icon name="users" size={16} />
          {createOpen ? "Yopish" : "Yangi foydalanuvchi"}
        </button>
      </header>

      {createOpen ? (
        <form className={styles.createForm} onSubmit={createUser}>
          <div className={styles.formHead}>
            <div>
              <span className={styles.eyebrow}>Yangi account</span>
              <h2>Foydalanuvchi qo‘shish</h2>
            </div>
            <small>Barcha maydonlar majburiy</small>
          </div>
          <div className={styles.formGrid}>
            <label>
              To‘liq ism
              <input name="name" minLength={2} maxLength={100} required />
            </label>
            <label>
              Email
              <input name="email" type="email" maxLength={254} required />
            </label>
            <label>
              Vaqtinchalik parol
              <input
                name="password"
                type="password"
                minLength={8}
                maxLength={200}
                autoComplete="new-password"
                required
              />
            </label>
            <label>
              Role
              <select name="role" defaultValue="ANALYST">
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={busyId === "create"}
          >
            {busyId === "create" ? "Yaratilmoqda…" : "Account yaratish"}
          </button>
        </form>
      ) : null}

      {error ? <div className={styles.error}>{error}</div> : null}
      {message ? <div className={styles.success}>{message}</div> : null}

      <section className={styles.stats}>
        <article>
          <span>Jami user</span>
          <strong>{data?.stats.total ?? "—"}</strong>
        </article>
        <article>
          <span>Faol user</span>
          <strong>{data?.stats.active ?? "—"}</strong>
        </article>
        <article>
          <span>Faol admin</span>
          <strong>{data?.stats.admins ?? "—"}</strong>
        </article>
        <article>
          <span>Bugun kirgan</span>
          <strong>{data?.stats.loggedInToday ?? "—"}</strong>
        </article>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHead}>
          <div>
            <span className={styles.eyebrow}>Jamoa</span>
            <h2>Account va ruxsatlar</h2>
          </div>
          <small>{data?.items.length ?? 0} ta yozuv</small>
        </div>

        {!data ? <p className={styles.loading}>Yuklanmoqda…</p> : null}
        {data?.items.length === 0 ? (
          <p className={styles.loading}>Hali foydalanuvchi yo‘q.</p>
        ) : null}

        <div className={styles.userList}>
          {data?.items.map((user) => {
            const isSelf = user.id === currentUser.id;
            return (
              <article className={styles.userRow} key={user.id}>
                <span className={styles.avatar}>{initials(user.name)}</span>
                <div className={styles.identity}>
                  <strong>
                    {user.name} {isSelf ? <em>Siz</em> : null}
                  </strong>
                  <small>{user.email}</small>
                </div>
                <div className={styles.lastLogin}>
                  <span>Oxirgi kirish</span>
                  <strong>{formatDate(user.lastLoginAt)}</strong>
                </div>
                <select
                  className={styles.roleSelect}
                  value={user.role}
                  disabled={isSelf || busyId === user.id}
                  aria-label={`${user.name} role`}
                  onChange={(event) =>
                    updateUser(
                      user.id,
                      { role: event.target.value },
                      "Role yangilandi.",
                    )
                  }
                >
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={`${styles.statusButton} ${user.isActive ? styles.active : styles.inactive}`}
                  disabled={isSelf || busyId === user.id}
                  onClick={() =>
                    updateUser(
                      user.id,
                      { isActive: !user.isActive },
                      user.isActive
                        ? "Account o‘chirildi."
                        : "Account faollashtirildi.",
                    )
                  }
                >
                  {user.isActive ? "Faol" : "O‘chirilgan"}
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={busyId === user.id}
                  onClick={() =>
                    setResetUserId((current) =>
                      current === user.id ? null : user.id,
                    )
                  }
                >
                  Parol
                </button>
                {resetUserId === user.id ? (
                  <form
                    className={styles.resetForm}
                    onSubmit={(event) => resetPassword(event, user.id)}
                  >
                    <label>
                      Yangi parol
                      <input
                        name="password"
                        type="password"
                        minLength={8}
                        maxLength={200}
                        autoComplete="new-password"
                        required
                      />
                    </label>
                    <button
                      type="submit"
                      className={styles.primaryButton}
                      disabled={busyId === user.id}
                    >
                      Saqlash
                    </button>
                  </form>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
