import { getHost } from "@/services/host";
import { generateUserKey, setUserKey } from "@/services/key";
import { setAccessToken } from "@/services/token";
import { hash } from "@/utils/hash";
import {
  type ApiResult,
  type LoginSchema,
  type RegisterSchema,
  loginSchema,
  registerSchema,
} from "./types";

export async function register(data: RegisterSchema): Promise<ApiResult> {
  const parseResult = registerSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors.map((e) => e.message).join("\n"),
    };
  }

  try {
    const res = await fetch(`https://${getHost()}/public/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.username,
        password: await hashPassword(data.password, data.username),
      }),
    });

    if (res.ok) {
      await login(data);

      return {
        success: true,
        message: "登録が完了しました",
        status: res.status,
      };
    }

    return {
      success: false,
      message: await res.text(),
      status: res.status,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function login(data: LoginSchema): Promise<ApiResult> {
  const parseResult = loginSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      message: parseResult.error.errors.map((e) => e.message).join("\n"),
    };
  }

  try {
    const res = await fetch(`https://${getHost()}/public/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.username,
        password: await hashPassword(data.password, data.username),
      }),
    });

    if (res.ok) {
      const body = await res.json();

      setAccessToken(body.token);
      setUserKey(await generateUserKey(data.username, data.password));

      return {
        success: true,
        message: "ログインに成功しました",
        status: res.status,
      };
    }

    return {
      success: false,
      message: await res.text(),
      status: res.status,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function hashPassword(password: string, salt: string): Promise<string> {
  return await hash(password, "SHA-256", salt);
}
