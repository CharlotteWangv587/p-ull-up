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

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected ? true : undefined}
      aria-label={ariaLabel}
    >
      {label}
    </button>
  );
}

