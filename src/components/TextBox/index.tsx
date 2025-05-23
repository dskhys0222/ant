import type { TextBoxProps } from "./types";

export default function TextBox(props: TextBoxProps) {
  const {
    type = "text",
    placeholder = "",
    value,
    onChange,
    required = false,
  } = props;

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="border rounded px-3 py-2"
    />
  );
}
