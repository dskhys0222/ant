import styles from "./styles";
import type { LabelProps } from "./types";

export default function Label({ htmlFor, children, className }: LabelProps) {
  return (
    <label className={className ?? styles.label} htmlFor={htmlFor}>
      {children}
    </label>
  );
}
