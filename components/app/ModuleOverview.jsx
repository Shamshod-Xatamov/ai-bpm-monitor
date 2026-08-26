import Icon from "@/components/ui/Icon";
import styles from "./ModuleOverview.module.css";

export default function ModuleOverview({ module }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.icon}>
          <Icon name={module.icon} size={24} />
        </span>
        <div>
          <span>AI-BPM moduli</span>
          <p>{module.description}</p>
        </div>
        <button type="button">Yangi yozuv</button>
      </header>

      <section className={styles.stats} aria-label="Modul ko‘rsatkichlari">
        {module.stats.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className={styles.foundation}>
        <div className={styles.foundationCopy}>
          <span>Product roadmap</span>
          <h2>Modul foundation’i tayyor</h2>
          <p>
            Ushbu bo‘lim app shell, navigatsiya va umumiy data layer bilan
            ulangan. Keyingi sprintda modulning asosiy workflow va jadvallari
            quriladi.
          </p>
        </div>
        <div className={styles.featureList}>
          {module.features.map((feature, index) => (
            <div key={feature}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{feature}</strong>
              <Icon name="chevron" size={16} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
