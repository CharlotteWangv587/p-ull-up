"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import styles from "./theme-toggle.module.css";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Read the class that was already set by the anti-FOUC script
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch (_) {}
  }

  return (
    <button
      onClick={toggle}
      className={styles.btn}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
