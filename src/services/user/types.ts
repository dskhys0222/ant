import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードは必須です"),
});

export const loginSchema = registerSchema;

export type RegisterSchema = z.infer<typeof registerSchema>;

export type LoginSchema = z.infer<typeof loginSchema>;

export interface ApiResult {
  success: boolean;
  message: string;
  status?: number;
}
