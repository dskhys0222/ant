import styles from "./styles.module.css";
import type { ErrorMessageProps } from "./types";

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  return <div className={styles.error}>{message}</div>;
}
