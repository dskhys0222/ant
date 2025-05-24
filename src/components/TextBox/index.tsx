import styles from "./styles.module.css";
import type { TextBoxProps } from "./types";

export default function TextBox(props: TextBoxProps) {
  const {
    id,
    type = "text",
    placeholder = "",
    value,
    onChange,
    required = false,
  } = props;

  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={styles.textBox}
    />
  );
}
