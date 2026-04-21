import styles from "./tag-button.module.css";

export type TagButtonProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
  className?: string;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  /** Campus-specific accent color. Overrides the default purple scheme. */
  accentColor?: string;
};

export default function TagButton({
  label,
  selected,
  disabled,
  onClick,
  size = "md",
  className,
  type = "button",
  ariaLabel,
  accentColor,
}: TagButtonProps) {
  const cls = [
    styles.tag,
    size === "sm" ? styles.tagSm : null,
    selected ? styles.tagSelected : null,
    disabled ? styles.tagDisabled : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(" ");

  // When an accentColor is provided, override the default purple with the campus color.
  const accentStyle: React.CSSProperties | undefined = accentColor
    ? selected
      ? { background: accentColor, borderColor: "transparent" }
      : { borderColor: accentColor, color: accentColor }
    : undefined;

  return (
    <button
      type={type}
      className={cls}
      style={accentStyle}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected ? true : undefined}
      aria-label={ariaLabel}
    >
      {label}
    </button>
  );
}

