import ErrorMessage from "@/components/ErrorMessage";
import Label from "@/components/Label";
import TextBox from "@/components/TextBox";
import { useId } from "react";

import type { TextFieldProps } from "./types";

export default function TextField({
  id: idProp,
  label,
  type = "text",
  value,
  onChange,
  errorMessage,
  className,
  required = false,
  placeholder,
}: TextFieldProps) {
  const generatedId = useId();
  const id = idProp || generatedId;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <TextBox
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
      />
      <ErrorMessage message={errorMessage} />
    </div>
  );
}
