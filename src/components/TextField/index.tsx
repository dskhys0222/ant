import ErrorMessage from "@/components/ErrorMessage";
import Label from "@/components/Label";
import TextBox from "@/components/TextBox";
import { useId } from "react";

import type { LabeledTextBoxProps } from "./types";

export default function TextField({
  id: idProp,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  errorMessage,
  className,
}: LabeledTextBoxProps) {
  const generatedId = useId();
  const id = idProp || generatedId;
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <TextBox
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
      />
      <ErrorMessage message={errorMessage} />
    </div>
  );
}
