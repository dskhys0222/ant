import { hash } from "@/utils/hash";
import {
  type RegistrationResult,
  type RegistrationSchema,
  registrationSchema,
} from "./types";

export async function registerUser(
  data: RegistrationSchema,
): Promise<RegistrationResult> {
  // 入力バリデーション
  const parseResult = registrationSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors.map((e) => e.message).join("\n"),
    };
  }

  try {
    const hashedPassword = await hash(data.password);

    const res = await fetch(`https://${data.host}/public/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.username,
        password: hashedPassword,
      }),
    });

    if (res.ok) {
      return {
        success: true,
        message: "登録が完了しました",
      };
    }

    const errorData = await res.json();
    return {
      success: false,
      message: errorData.message,
      status: res.status,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
