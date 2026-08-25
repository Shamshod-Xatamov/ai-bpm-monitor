"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  currentUser,
  navigationGroups,
  smartAlerts,
} from "@/lib/dashboard-data";
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
        <small>Monitor</small>
      </span>
    </Link>
  );
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const currentPage = useMemo(
    () => pageNames[pathname] ?? "AI-BPM Monitor",
    [pathname],
  );

  useEffect(() => {
    if (!openMenu) return undefined;

    const handlePointerDown = (event) => {
      if (!event.target.closest?.("[data-menu-root]")) setOpenMenu(null);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpenMenu(null);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

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

          <div className={styles.topbarActions} data-menu-root>
            <span className={styles.liveStatus}>
              <i /> Tizim barqaror
            </span>

            <span className={styles.topbarDivider} aria-hidden="true" />

            <div className={styles.menuAnchor}>
              <button
                className={`${styles.iconButton} ${openMenu === "alerts" ? styles.iconButtonOn : ""}`}
                type="button"
                aria-label="Bildirishnomalar"
                aria-expanded={openMenu === "alerts"}
                onClick={() =>
                  setOpenMenu((current) =>
                    current === "alerts" ? null : "alerts",
                  )
                }
              >
                <Icon name="bell" size={19} />
                <span className={styles.notificationDot}>
                  {smartAlerts.length}
                </span>
              </button>

              {openMenu === "alerts" ? (
                <div
                  className={styles.popover}
                  role="dialog"
                  aria-label="Bildirishnomalar"
                >
                  <div className={styles.popoverHead}>
                    <strong>Smart alertlar</strong>
                    <small>{smartAlerts.length} ta yangi</small>
                  </div>
                  <ul className={styles.alertList}>
                    {smartAlerts.map((alert) => (
                      <li
                        key={alert.title}
                        className={styles[`alert_${alert.tone}`]}
                      >
                        <i />
                        <div>
                          <strong>{alert.title}</strong>
                          <span>{alert.process}</span>
                          <em>{alert.detail}</em>
                        </div>
                        <small>{alert.time}</small>
                      </li>
                    ))}
                  </ul>
                  <Link
                    className={styles.popoverAction}
                    href="/risks"
                    onClick={() => setOpenMenu(null)}
                  >
                    Barcha signallar <Icon name="chevron" size={13} />
                  </Link>
                </div>
              ) : null}
            </div>

            <div className={styles.menuAnchor}>
              <button
                className={`${styles.profileButton} ${openMenu === "profile" ? styles.profileButtonOn : ""}`}
                type="button"
                aria-label="Profil menyusi"
                aria-expanded={openMenu === "profile"}
                onClick={() =>
                  setOpenMenu((current) =>
                    current === "profile" ? null : "profile",
                  )
                }
              >
                {currentUser.initials}
              </button>

              {openMenu === "profile" ? (
                <div
                  className={`${styles.popover} ${styles.profilePopover}`}
                  role="menu"
                >
                  <div className={styles.profileCard}>
                    <span>{currentUser.initials}</span>
                    <div>
                      <strong>{currentUser.name}</strong>
                      <small>
                        {currentUser.role} · {currentUser.organization}
                      </small>
                    </div>
                  </div>
                  <Link
                    href="/settings"
                    role="menuitem"
                    onClick={() => setOpenMenu(null)}
                  >
                    <Icon name="settings" size={16} /> Sozlamalar
                  </Link>
                  <Link
                    href="/users"
                    role="menuitem"
                    onClick={() => setOpenMenu(null)}
                  >
                    <Icon name="users" size={16} /> Jamoa va rollar
                  </Link>
                  <Link
                    className={styles.menuDanger}
                    href="/login"
                    role="menuitem"
                  >
                    <Icon name="logout" size={16} /> Chiqish
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className={styles.content} id="dashboard-content">
          {children}
        </main>
      </section>
    </div>
  );
}
