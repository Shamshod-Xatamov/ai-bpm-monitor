import styles from "./Sparkline.module.css";

/**
 * Kichik trend chizig‘i. Qiymatlar o‘z diapazoniga normallashtiriladi, shuning
 * uchun turli shkaladagi ko‘rsatkichlar yonma-yon o‘qiladi.
 */
export default function Sparkline({
  values,
  tone = "neutral",
  className = "",
  label,
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 76;
      const y = 24 - ((value - min) / span) * 20;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      className={`${styles.sparkline} ${styles[`tone_${tone}`]} ${className}`}
      viewBox="0 0 76 28"
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
    >
      <polyline points={points} />
    </svg>
  );
}
