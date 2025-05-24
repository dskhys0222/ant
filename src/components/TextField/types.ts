import type { TextBoxType } from "@/components/TextBox/types";

export type TextFieldProps = {
  id?: string;
  label: string;
  type?: TextBoxType;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  className?: string;
  required?: boolean;
  placeholder?: string;
};
