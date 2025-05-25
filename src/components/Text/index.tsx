import styles from "./styles";
import type { TextProps } from "./types";

export default function Text(props: TextProps) {
  const { value, size } = props;

  return <div className={`${styles.text} ${styles[size]}`}>{value}</div>;
}
