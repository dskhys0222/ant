import styles from "./styles.module.css";
import type { LabelProps } from "./types";

export default function Label({ htmlFor, children, className }: LabelProps) {
  return (
    <label className={className ?? styles.label} htmlFor={htmlFor}>
      {children}
    </label>
  );
}
