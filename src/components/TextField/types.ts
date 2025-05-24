import type { TextBoxType } from "@/components/TextBox/types";
import type { ChangeEvent } from "react";

export type LabeledTextBoxProps = {
  id?: string;
  label: string;
  type?: TextBoxType;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  errorMessage?: string;
  className?: string;
};
