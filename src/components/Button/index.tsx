import styles from "./styles";
import type { ButtonProps } from "./types";

export default function Button(props: ButtonProps) {
  const {
    type = "button",
    variant = "primary",
    size = "medium",
    disabled = false,
    onClick,
    children,
  } = props;

  const className = [styles.button, styles[variant], styles[size]].join(" ");

  return (
    <button
      className={className}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
