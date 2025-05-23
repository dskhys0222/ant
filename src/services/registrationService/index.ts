import { hash } from "@/utils/hash";
import type { RegistrationData, RegistrationResult } from "./types";

export async function registerUser(
  data: RegistrationData,
): Promise<RegistrationResult> {
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
