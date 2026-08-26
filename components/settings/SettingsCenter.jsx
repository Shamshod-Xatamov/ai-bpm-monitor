"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import styles from "./SettingsCenter.module.css";

const sections = [
  {
    id: "general",
    label: "Umumiy",
    description: "Tashkilot va lokalizatsiya",
    icon: "settings",
  },
  {
    id: "monitoring",
    label: "Monitoring",
    description: "Oqim va alert qoidalari",
    icon: "monitor",
  },
  {
    id: "notifications",
    label: "Bildirishnomalar",
    description: "Kanallar va ustuvorlik",
    icon: "bell",
  },
  {
    id: "integrations",
    label: "Integratsiyalar",
    description: "Tashqi tizimlar",
    icon: "process",
  },
  {
    id: "security",
    label: "Xavfsizlik",
    description: "Kirish va audit",
    icon: "risk",
  },
];

const initialSettings = {
  organization: "Orient Business Group",
  language: "uz",
  timezone: "Asia/Tashkent",
  currency: "UZS",
  compactNumbers: true,
  weeklyDigest: true,
  refreshRate: "30",
  sensitivity: "balanced",
  delayThreshold: "15",
  autoAcknowledge: false,
  quietHours: true,
  inAppCritical: true,
  emailCritical: true,
  emailDigest: true,
  telegramCritical: false,
  notifyAssignments: true,
  erpIntegration: true,
  crmIntegration: true,
  telegramIntegration: false,
  mfaRequired: true,
  sessionTimeout: "30",
  newDeviceAlert: true,
  auditExport: true,
};

const sectionCopy = {
  general: {
    title: "Platforma sozlamalari",
    description:
      "Tashkilot nomi, interfeys tili va hisobotlarda ishlatiladigan asosiy formatlar.",
  },
  monitoring: {
    title: "Monitoring qoidalari",
    description:
      "Ma’lumot oqimi yangilanishi, anomaliya sezgirligi va kechikish chegaralarini boshqaring.",
  },
  notifications: {
    title: "Bildirishnoma siyosati",
    description:
      "Muhim hodisalar qaysi kanal orqali va kimlarga yetkazilishini belgilang.",
  },
  integrations: {
    title: "Tizim integratsiyalari",
    description:
      "Jarayon ma’lumotlarini tashqi tizimlar bilan sinxronlash holatini boshqaring.",
  },
  security: {
    title: "Xavfsizlik va audit",
    description:
      "Kirish talablari, seanslar va muhim amallar auditini nazorat qiling.",
  },
};

function Toggle({ checked, label, onChange }) {
  return (
    <button
      className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

function SettingRow({ title, description, children }) {
  return (
    <div className={styles.settingRow}>
      <div className={styles.settingCopy}>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <div className={styles.settingControl}>{children}</div>
    </div>
  );
}

function Field({ id, label, hint, children }) {
  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function IntegrationCard({ name, detail, meta, monogram, enabled, onChange }) {
  return (
    <article className={styles.integrationCard}>
      <div className={styles.integrationMark} aria-hidden="true">
        {monogram}
      </div>
      <div className={styles.integrationCopy}>
        <div>
          <strong>{name}</strong>
          <span
            className={`${styles.connectionStatus} ${
              enabled ? styles.connectionOn : ""
            }`}
          >
            <i /> {enabled ? "Ulangan" : "Ulanmagan"}
          </span>
        </div>
        <p>{detail}</p>
        <small>{enabled ? meta : "Sinxronlash o‘chirilgan"}</small>
      </div>
      <Toggle
        checked={enabled}
        label={`${name} integratsiyasi`}
        onChange={onChange}
      />
    </article>
  );
}

export default function SettingsCenter() {
  const [activeSection, setActiveSection] = useState("general");
  const [settings, setSettings] = useState(initialSettings);
  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [savedAt, setSavedAt] = useState("Bugun, 11:24");

  const dirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings],
  );
  const activeCopy = sectionCopy[activeSection];

  const update = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSavedSettings(settings);
    setSavedAt("hozirgina");
  };

  const handleReset = () => setSettings(savedSettings);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.kicker}>Platforma konfiguratsiyasi</span>
          <p>
            Monitoring muhiti, bildirishnomalar va kirish siyosatini bitta
            joydan boshqaring.
          </p>
        </div>
        <div className={styles.saveArea}>
          <span
            className={`${styles.saveState} ${dirty ? styles.saveStateDirty : ""}`}
            aria-live="polite"
          >
            <i /> {dirty ? "Saqlanmagan o‘zgarishlar" : `Saqlandi · ${savedAt}`}
          </span>
          <button
            className={styles.resetButton}
            type="button"
            disabled={!dirty}
            onClick={handleReset}
          >
            Bekor qilish
          </button>
          <button
            className={styles.saveButton}
            type="submit"
            form="settings-form"
            disabled={!dirty}
          >
            <Icon name="check" size={15} /> Saqlash
          </button>
        </div>
      </header>

      <section className={styles.summary} aria-label="Sozlamalar holati">
        <article>
          <span className={styles.summaryIcon}>
            <Icon name="building" size={17} />
          </span>
          <div>
            <small>Faol tashkilot</small>
            <strong>{settings.organization}</strong>
          </div>
          <em>Production</em>
        </article>
        <article>
          <span className={styles.summaryIcon}>
            <Icon name="process" size={17} />
          </span>
          <div>
            <small>Integratsiyalar</small>
            <strong>
              {
                [
                  settings.erpIntegration,
                  settings.crmIntegration,
                  settings.telegramIntegration,
                ].filter(Boolean).length
              }
              /3 faol
            </strong>
          </div>
          <em className={styles.summaryOk}>Barqaror</em>
        </article>
        <article>
          <span className={styles.summaryIcon}>
            <Icon name="check" size={17} />
          </span>
          <div>
            <small>Oxirgi audit</small>
            <strong>Bugun, 09:42</strong>
          </div>
          <em className={styles.summaryOk}>Muammosiz</em>
        </article>
      </section>

      <form
        className={styles.settingsLayout}
        id="settings-form"
        onSubmit={handleSubmit}
      >
        <nav className={styles.sectionNav} aria-label="Sozlamalar bo‘limlari">
          <span className={styles.navLabel}>Sozlamalar</span>
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={
                activeSection === section.id ? styles.sectionNavActive : ""
              }
              aria-current={activeSection === section.id ? "page" : undefined}
              onClick={() => setActiveSection(section.id)}
            >
              <span className={styles.navIcon}>
                <Icon name={section.icon} size={17} />
              </span>
              <span>
                <strong>{section.label}</strong>
                <small>{section.description}</small>
              </span>
              <Icon name="chevron" size={13} />
            </button>
          ))}
        </nav>

        <section
          className={styles.panel}
          aria-labelledby={`${activeSection}-title`}
        >
          <div className={styles.panelHeader}>
            <div>
              <span>Sozlamalar bo‘limi</span>
              <h2 id={`${activeSection}-title`}>{activeCopy.title}</h2>
              <p>{activeCopy.description}</p>
            </div>
            <span className={styles.environmentBadge}>
              <i /> Production
            </span>
          </div>

          {activeSection === "general" ? (
            <div className={styles.panelBody}>
              <section className={styles.settingsGroup}>
                <div className={styles.groupHeading}>
                  <span className={styles.groupIcon}>
                    <Icon name="building" size={17} />
                  </span>
                  <div>
                    <h3>Tashkilot profili</h3>
                    <p>
                      Platformada ko‘rinadigan asosiy tashkilot ma’lumotlari.
                    </p>
                  </div>
                </div>
                <div className={styles.formGrid}>
                  <Field
                    id="organization"
                    label="Tashkilot nomi"
                    hint="Hisobotlar va eksportlarda shu nom ishlatiladi."
                  >
                    <input
                      id="organization"
                      value={settings.organization}
                      onChange={(event) =>
                        update("organization", event.target.value)
                      }
                    />
                  </Field>
                  <Field id="environment" label="Muhit">
                    <input id="environment" value="Production" disabled />
                  </Field>
                </div>
              </section>

              <section className={styles.settingsGroup}>
                <div className={styles.groupHeading}>
                  <span className={styles.groupIcon}>
                    <Icon name="clock" size={17} />
                  </span>
                  <div>
                    <h3>Til va formatlar</h3>
                    <p>Interfeys, vaqt va moliyaviy qiymatlar formati.</p>
                  </div>
                </div>
                <div className={styles.formGridThree}>
                  <Field id="language" label="Interfeys tili">
                    <select
                      id="language"
                      value={settings.language}
                      onChange={(event) =>
                        update("language", event.target.value)
                      }
                    >
                      <option value="uz">O‘zbekcha</option>
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                    </select>
                  </Field>
                  <Field id="timezone" label="Vaqt mintaqasi">
                    <select
                      id="timezone"
                      value={settings.timezone}
                      onChange={(event) =>
                        update("timezone", event.target.value)
                      }
                    >
                      <option value="Asia/Tashkent">Tashkent · UTC+5</option>
                      <option value="Asia/Almaty">Almaty · UTC+5</option>
                      <option value="Europe/Moscow">Moscow · UTC+3</option>
                    </select>
                  </Field>
                  <Field id="currency" label="Hisobot valyutasi">
                    <select
                      id="currency"
                      value={settings.currency}
                      onChange={(event) =>
                        update("currency", event.target.value)
                      }
                    >
                      <option value="UZS">UZS · so‘m</option>
                      <option value="USD">USD · dollar</option>
                      <option value="EUR">EUR · yevro</option>
                    </select>
                  </Field>
                </div>
              </section>

              <section className={styles.settingsGroupCompact}>
                <SettingRow
                  title="Ixcham son formati"
                  description="1 250 000 o‘rniga 1.25 mln ko‘rinishidan foydalanish."
                >
                  <Toggle
                    checked={settings.compactNumbers}
                    label="Ixcham son formati"
                    onChange={(value) => update("compactNumbers", value)}
                  />
                </SettingRow>
                <SettingRow
                  title="Haftalik boshqaruv xulosasi"
                  description="Har dushanba rahbarlar uchun avtomatik summary tayyorlash."
                >
                  <Toggle
                    checked={settings.weeklyDigest}
                    label="Haftalik boshqaruv xulosasi"
                    onChange={(value) => update("weeklyDigest", value)}
                  />
                </SettingRow>
              </section>
            </div>
          ) : null}

          {activeSection === "monitoring" ? (
            <div className={styles.panelBody}>
              <section className={styles.settingsGroup}>
                <div className={styles.groupHeading}>
                  <span className={styles.groupIcon}>
                    <Icon name="refresh" size={17} />
                  </span>
                  <div>
                    <h3>Oqim parametrlari</h3>
                    <p>Real vaqt ma’lumotlari qanchalik tez yangilanishi.</p>
                  </div>
                </div>
                <div className={styles.formGridThree}>
                  <Field id="refreshRate" label="Yangilanish oralig‘i">
                    <select
                      id="refreshRate"
                      value={settings.refreshRate}
                      onChange={(event) =>
                        update("refreshRate", event.target.value)
                      }
                    >
                      <option value="15">Har 15 soniya</option>
                      <option value="30">Har 30 soniya</option>
                      <option value="60">Har 1 daqiqa</option>
                    </select>
                  </Field>
                  <Field id="sensitivity" label="Anomaliya sezgirligi">
                    <select
                      id="sensitivity"
                      value={settings.sensitivity}
                      onChange={(event) =>
                        update("sensitivity", event.target.value)
                      }
                    >
                      <option value="conservative">Past</option>
                      <option value="balanced">Balanslangan</option>
                      <option value="sensitive">Yuqori</option>
                    </select>
                  </Field>
                  <Field id="delayThreshold" label="Kechikish chegarasi">
                    <select
                      id="delayThreshold"
                      value={settings.delayThreshold}
                      onChange={(event) =>
                        update("delayThreshold", event.target.value)
                      }
                    >
                      <option value="10">10 daqiqa</option>
                      <option value="15">15 daqiqa</option>
                      <option value="30">30 daqiqa</option>
                    </select>
                  </Field>
                </div>
              </section>

              <section className={styles.settingsGroupCompact}>
                <SettingRow
                  title="Past riskli alertlarni avtomatik tasdiqlash"
                  description="Risk score 20 dan past bo‘lgan signallar navbatni band qilmaydi."
                >
                  <Toggle
                    checked={settings.autoAcknowledge}
                    label="Past riskli alertlarni avtomatik tasdiqlash"
                    onChange={(value) => update("autoAcknowledge", value)}
                  />
                </SettingRow>
                <SettingRow
                  title="Tinch soatlar"
                  description="22:00–07:00 oralig‘ida faqat kritik alertlarni yuborish."
                >
                  <Toggle
                    checked={settings.quietHours}
                    label="Tinch soatlar"
                    onChange={(value) => update("quietHours", value)}
                  />
                </SettingRow>
              </section>

              <div className={styles.rulePreview}>
                <span>Faol qoida</span>
                <strong>
                  Jarayon kutilgan koridordan {settings.delayThreshold} daqiqa
                  chiqsa, smart alert yaratiladi.
                </strong>
                <small>
                  Sezgirlik:{" "}
                  {settings.sensitivity === "balanced"
                    ? "balanslangan"
                    : settings.sensitivity === "sensitive"
                      ? "yuqori"
                      : "past"}
                </small>
              </div>
            </div>
          ) : null}

          {activeSection === "notifications" ? (
            <div className={styles.panelBody}>
              <section className={styles.settingsGroupCompact}>
                <div className={styles.groupHeadingInset}>
                  <span className={styles.groupIcon}>
                    <Icon name="bell" size={17} />
                  </span>
                  <div>
                    <h3>Platforma ichida</h3>
                    <p>Topbar va boshqaruv navbatidagi bildirishnomalar.</p>
                  </div>
                </div>
                <SettingRow
                  title="Kritik alertlar"
                  description="Yuqori riskli hodisa aniqlanganda darhol ko‘rsatish."
                >
                  <Toggle
                    checked={settings.inAppCritical}
                    label="Platformada kritik alertlar"
                    onChange={(value) => update("inAppCritical", value)}
                  />
                </SettingRow>
                <SettingRow
                  title="Yangi vazifa va tasdiqlar"
                  description="Sizga biriktirilgan qaror yoki tekshiruv haqida xabar berish."
                >
                  <Toggle
                    checked={settings.notifyAssignments}
                    label="Yangi vazifa va tasdiqlar"
                    onChange={(value) => update("notifyAssignments", value)}
                  />
                </SettingRow>
              </section>

              <section className={styles.settingsGroupCompact}>
                <div className={styles.groupHeadingInset}>
                  <span className={styles.groupIcon}>
                    <Icon name="report" size={17} />
                  </span>
                  <div>
                    <h3>Email</h3>
                    <p>aziz.karimov@orient.uz manziliga yuboriladi.</p>
                  </div>
                </div>
                <SettingRow
                  title="Kritik hodisalar"
                  description="Kritik signal yaratilgan zahoti email yuborish."
                >
                  <Toggle
                    checked={settings.emailCritical}
                    label="Email orqali kritik hodisalar"
                    onChange={(value) => update("emailCritical", value)}
                  />
                </SettingRow>
                <SettingRow
                  title="Kunlik digest"
                  description="Har ish kuni 18:00 da yakuniy faoliyat xulosasi."
                >
                  <Toggle
                    checked={settings.emailDigest}
                    label="Email kunlik digest"
                    onChange={(value) => update("emailDigest", value)}
                  />
                </SettingRow>
              </section>

              <section className={styles.settingsGroupCompact}>
                <SettingRow
                  title="Telegram orqali kritik alertlar"
                  description="Telegram integratsiyasi yoqilgandan keyin foydalanish mumkin."
                >
                  <Toggle
                    checked={settings.telegramCritical}
                    label="Telegram orqali kritik alertlar"
                    onChange={(value) => update("telegramCritical", value)}
                  />
                </SettingRow>
              </section>
            </div>
          ) : null}

          {activeSection === "integrations" ? (
            <div className={styles.panelBody}>
              <div className={styles.integrationList}>
                <IntegrationCard
                  name="1C ERP"
                  detail="Moliyaviy operatsiyalar, xarajatlar va bo‘limlar ma’lumotlari."
                  meta="Oxirgi sync 8 daqiqa oldin · 1 248 yozuv"
                  monogram="1C"
                  enabled={settings.erpIntegration}
                  onChange={(value) => update("erpIntegration", value)}
                />
                <IntegrationCard
                  name="Orient CRM"
                  detail="Mijoz murojaatlari, savdo leadlari va xizmat ko‘rsatish jarayonlari."
                  meta="Oxirgi sync 12 daqiqa oldin · 864 yozuv"
                  monogram="CR"
                  enabled={settings.crmIntegration}
                  onChange={(value) => update("crmIntegration", value)}
                />
                <IntegrationCard
                  name="Telegram Bot"
                  detail="Kritik alertlar va tasdiqlash navbatini rahbarlarga yetkazish."
                  meta="Oxirgi sync hozirgina"
                  monogram="TG"
                  enabled={settings.telegramIntegration}
                  onChange={(value) => update("telegramIntegration", value)}
                />
              </div>

              <div className={styles.integrationNote}>
                <Icon name="refresh" size={17} />
                <div>
                  <strong>Sinxronlash holati avtomatik tekshiriladi</strong>
                  <span>
                    Ulanish uzilsa Monitoring markazida texnik alert yaratiladi.
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === "security" ? (
            <div className={styles.panelBody}>
              <section className={styles.settingsGroupCompact}>
                <SettingRow
                  title="Ikki bosqichli tasdiqlash majburiy"
                  description="Barcha rahbar va administrator rollari uchun MFA talab qilinadi."
                >
                  <Toggle
                    checked={settings.mfaRequired}
                    label="Ikki bosqichli tasdiqlash"
                    onChange={(value) => update("mfaRequired", value)}
                  />
                </SettingRow>
                <SettingRow
                  title="Yangi qurilma haqida ogohlantirish"
                  description="Noma’lum qurilmadan kirilganda email va platformada xabar berish."
                >
                  <Toggle
                    checked={settings.newDeviceAlert}
                    label="Yangi qurilma haqida ogohlantirish"
                    onChange={(value) => update("newDeviceAlert", value)}
                  />
                </SettingRow>
                <SettingRow
                  title="Audit eksporti"
                  description="Muhim sozlama o‘zgarishlarini kunlik arxivga yozish."
                >
                  <Toggle
                    checked={settings.auditExport}
                    label="Audit eksporti"
                    onChange={(value) => update("auditExport", value)}
                  />
                </SettingRow>
              </section>

              <section className={styles.settingsGroup}>
                <div className={styles.groupHeading}>
                  <span className={styles.groupIcon}>
                    <Icon name="clock" size={17} />
                  </span>
                  <div>
                    <h3>Seans nazorati</h3>
                    <p>
                      Faol bo‘lmagan foydalanuvchi seansi yakunlanish vaqti.
                    </p>
                  </div>
                </div>
                <div className={styles.singleField}>
                  <Field id="sessionTimeout" label="Avtomatik chiqish">
                    <select
                      id="sessionTimeout"
                      value={settings.sessionTimeout}
                      onChange={(event) =>
                        update("sessionTimeout", event.target.value)
                      }
                    >
                      <option value="15">15 daqiqadan keyin</option>
                      <option value="30">30 daqiqadan keyin</option>
                      <option value="60">1 soatdan keyin</option>
                      <option value="never">O‘chirilgan</option>
                    </select>
                  </Field>
                </div>
              </section>

              <section className={styles.auditCard}>
                <div className={styles.auditHeader}>
                  <div>
                    <span>Oxirgi amallar</span>
                    <h3>Audit jurnali</h3>
                  </div>
                  <button type="button">Barchasini ko‘rish</button>
                </div>
                <ul>
                  <li>
                    <span className={styles.auditAvatar}>AK</span>
                    <div>
                      <strong>Alert chegarasi yangilandi</strong>
                      <small>Aziz Karimov · Bugun, 09:42</small>
                    </div>
                    <em>Monitoring</em>
                  </li>
                  <li>
                    <span className={styles.auditAvatar}>DR</span>
                    <div>
                      <strong>Yangi foydalanuvchi roli yaratildi</strong>
                      <small>D. Rahimova · Kecha, 16:18</small>
                    </div>
                    <em>Xavfsizlik</em>
                  </li>
                </ul>
              </section>
            </div>
          ) : null}
        </section>
      </form>
    </div>
  );
}
