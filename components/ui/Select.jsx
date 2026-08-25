"use client";

import { useEffect, useId, useRef, useState } from "react";
import Icon from "./Icon";
import styles from "./Select.module.css";

/**
 * Native `select` o‘rnini bosuvchi dropdown.
 *
 * Fokus doim tetik tugmada qoladi, faol variant esa `aria-activedescendant`
 * orqali e’lon qilinadi — bu klaviatura va skrinrider uchun eng barqaror naqsh.
 */
export default function Select({
  label,
  value,
  options,
  onChange,
  align = "start",
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const baseId = useId();

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const current = options[selectedIndex];
  const optionId = (index) => `${baseId}-option-${index}`;

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  // Klaviatura bilan yurilganda faol variant ko‘rinish maydonida qoladi.
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [open, activeIndex]);

  const openList = (index) => {
    setActiveIndex(index);
    setOpen(true);
  };

  const commit = (index) => {
    onChange(options[index].value);
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    const { key } = event;

    if (!open) {
      if (
        key === "ArrowDown" ||
        key === "ArrowUp" ||
        key === "Enter" ||
        key === " "
      ) {
        event.preventDefault();
        openList(selectedIndex);
      }
      return;
    }

    if (key === "Escape" || key === "Tab") {
      setOpen(false);
      return;
    }

    if (key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % options.length);
    } else if (key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + options.length) % options.length);
    } else if (key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (key === "Enter" || key === " ") {
      event.preventDefault();
      commit(activeIndex);
    }
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        role="combobox"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${baseId}-list`}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        aria-label={label}
        onClick={() => (open ? setOpen(false) : openList(selectedIndex))}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{current?.label}</span>
        <Icon name="chevron" size={13} />
      </button>

      {open ? (
        <ul
          className={`${styles.list} ${align === "end" ? styles.listEnd : ""}`}
          id={`${baseId}-list`}
          role="listbox"
          aria-label={label}
          ref={listRef}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={index === selectedIndex}
              className={`${index === activeIndex ? styles.optionActive : ""} ${
                index === selectedIndex ? styles.optionSelected : ""
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => commit(index)}
            >
              <span>{option.label}</span>
              {index === selectedIndex ? <Icon name="check" size={14} /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
