import type { ChangeEvent } from "react";

/**
 * テキストボックスとして妥当なHTML input typeの定義
 */
export type TextBoxType =
  | "text"
  | "password"
  | "email"
  | "tel"
  | "url"
  | "search"
  | "number"
  | "date"
  | "datetime-local"
  | "month"
  | "week"
  | "time";

export type TextBoxProps = {
  /** input要素のid属性 */
  id?: string;
  /** テキストボックスの入力タイプ */
  type?: TextBoxType;
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** 入力値 */
  value: string;
  /** 値変更時のイベントハンドラ */
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  /** 必須フィールドかどうか */
  required?: boolean;
};
