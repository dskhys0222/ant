import { z } from "zod";
import { hostRegex } from "@/constants";

export const registrationSchema = z.object({
  username: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードは必須です"),
  host: z.string().regex(hostRegex, "有効なドメイン名を入力してください"),
});

export type RegistrationSchema = z.infer<typeof registrationSchema>;

export interface RegistrationResult {
  success: boolean;
  message: string;
  status?: number;
}
