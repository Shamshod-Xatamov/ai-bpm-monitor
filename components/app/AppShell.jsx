"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { currentUser, navigationGroups } from "@/lib/dashboard-data";
import Icon from "@/components/ui/Icon";
import styles from "./AppShell.module.css";

const pageNames = {
  ...Object.fromEntries(
    navigationGroups.flatMap((group) =>
      group.items.map((item) => [item.href, item.label]),
    ),
  ),
  "/settings": "Sozlamalar",
};

function Brand() {
  return (
    <Link
      className={styles.brand}
      href="/dashboard"
      aria-label="AI-BPM Dashboard"
    >
      <span className={styles.brandMark} aria-hidden="true">
        <svg viewBox="0 0 42 42" fill="none">
          <path d="M12 11.5h12.5A6.5 6.5 0 0 1 31 18v12.5" />
          <path d="M30 30.5H17.5A6.5 6.5 0 0 1 11 24V11.5" />
          <circle cx="11" cy="11.5" r="3" />
          <circle cx="31" cy="30.5" r="3" />
          <path d="m16.5 21 3 3 6-7" />
        </svg>
      </span>
      <span className={styles.brandCopy}>
        <strong>AI-BPM</strong>
        <small>Business intelligence</small>
      </span>
    </Link>
  );
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = useMemo(
    () => pageNames[pathname] ?? "AI-BPM Monitor",
    [pathname],
  );

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.body.classList.add("app-drawer-open");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("app-drawer-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <div
      className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ""}`}
    >
      <a className={styles.skipLink} href="#dashboard-content">
        Asosiy kontentga o‘tish
      </a>

      <button
        className={`${styles.overlay} ${mobileOpen ? styles.overlayVisible : ""}`}
        type="button"
        aria-label="Mobil menyuni yopish"
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}
        aria-label="Platforma navigatsiyasi"
      >
        <div className={styles.sidebarTop}>
          <Brand />
          <button
            className={styles.collapseButton}
            type="button"
            aria-label={
              collapsed ? "Sidebarni kengaytirish" : "Sidebarni yig‘ish"
            }
            aria-pressed={collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            <Icon name="collapse" size={17} />
          </button>
          <button
            className={styles.mobileClose}
            type="button"
            aria-label="Mobil menyuni yopish"
            onClick={() => setMobileOpen(false)}
          >
            ×
          </button>
        </div>

        <button className={styles.organization} type="button">
          <span className={styles.organizationMark}>OB</span>
          <span className={styles.organizationCopy}>
            <small>Faol tashkilot</small>
            <strong>{currentUser.organization}</strong>
          </span>
          <Icon name="chevron" size={14} />
        </button>

        <nav className={styles.navigation} aria-label="Asosiy bo‘limlar">
          {navigationGroups.map((group) => (
            <div className={styles.navGroup} key={group.label}>
              <span className={styles.navGroupLabel}>{group.label}</span>
              <div className={styles.navItems}>
                {group.items.map((item) => {
                  const active = pathname === item.href;

                  return (
                    <Link
                      className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                      href={item.href}
                      key={item.href}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon name={item.icon} size={18} />
                      <span>{item.label}</span>
                      {item.badge ? <b>{item.badge}</b> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link
            className={styles.settingsLink}
            href="/settings"
            title={collapsed ? "Sozlamalar" : undefined}
          >
            <Icon name="settings" size={18} />
            <span>Sozlamalar</span>
          </Link>
          <button className={styles.userButton} type="button">
            <span className={styles.avatar}>{currentUser.initials}</span>
            <span className={styles.userCopy}>
              <strong>{currentUser.name}</strong>
              <small>{currentUser.role} · Online</small>
            </span>
            <Icon name="dots" size={18} />
          </button>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.topbarStart}>
            <button
              className={styles.mobileMenuButton}
              type="button"
              aria-label="Mobil menyuni ochish"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Icon name="menu" size={20} />
            </button>
            <div className={styles.pageContext}>
              <span>Ish maydoni</span>
              <strong>{currentPage}</strong>
            </div>
          </div>

          <div className={styles.topbarActions}>
            <span className={styles.demoBadge}>Demo ma’lumot</span>
            <span className={styles.liveStatus}>
              <i /> Tizim barqaror
            </span>
            <button
              className={styles.iconButton}
              type="button"
              aria-label="Bildirishnomalar"
            >
              <Icon name="bell" size={19} />
              <span className={styles.notificationDot}>3</span>
            </button>
            <button
              className={styles.profileButton}
              type="button"
              aria-label="Profil menyusi"
            >
              {currentUser.initials}
            </button>
          </div>
        </header>

        <main className={styles.content} id="dashboard-content">
          {children}
        </main>
      </section>
    </div>
  );
}
