import * as hashModule from "@/utils/hash";
import { beforeEach, expect, test, vi } from "vitest";
import { registerUser } from "./index";

// fetch のモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();

  // hash 関数をモック化
  vi.spyOn(hashModule, "hash").mockImplementation(async (password) => {
    return `hashed_${password}`;
  });
});

test("ユーザー登録が成功する", async () => {
  // 成功レスポンスのモック
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: "登録が完了しました" }),
  });

  const result = await registerUser({
    username: "testuser",
    password: "password123",
    host: "example.com",
  });

  expect(mockFetch).toHaveBeenCalledWith(
    "https://example.com/public/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser",
        password: "hashed_password123",
      }),
    },
  );

  expect(result).toEqual({
    success: true,
    message: "登録が完了しました",
  });
});

test("登録エラーを処理する", async () => {
  // エラーレスポンスのモック
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 400,
    json: async () => ({ message: "ユーザー名が既に使用されています" }),
  });

  const result = await registerUser({
    username: "existinguser",
    password: "password123",
    host: "example.com",
  });

  expect(result).toEqual({
    success: false,
    message: "ユーザー名が既に使用されています",
    status: 400,
  });
});

test("ネットワークエラーを処理する", async () => {
  // ネットワークエラーのモック
  mockFetch.mockRejectedValueOnce(new Error("ネットワークエラー"));

  const result = await registerUser({
    username: "testuser",
    password: "password123",
    host: "example.com",
  });

  expect(result).toEqual({
    success: false,
    message: "ネットワークエラー",
  });
});
test("標準外のエラーレスポンス形式を処理する", async () => {
  // エラーレスポンスでJSONがない場合のモック
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: async () => {
      throw new Error("Invalid JSON");
    },
  });

  const result = await registerUser({
    username: "testuser",
    password: "password123",
    host: "example.com",
  });

  expect(result).toEqual({
    success: false,
    message: "Invalid JSON",
  });
});

test("ハッシュ関数のエラーを処理する", async () => {
  // hash関数がエラーを投げる場合
  vi.spyOn(hashModule, "hash").mockRejectedValueOnce(
    new Error("Hashing failed"),
  );

  const result = await registerUser({
    username: "testuser",
    password: "password123",
    host: "example.com",
  });

  expect(result).toEqual({
    success: false,
    message: "Hashing failed",
  });

  // fetchが呼ばれていないことを確認
  expect(mockFetch).not.toHaveBeenCalled();
});

test("Error型以外の例外を処理する", async () => {
  // Errorオブジェクトではない例外
  mockFetch.mockRejectedValueOnce("String error");

  const result = await registerUser({
    username: "testuser",
    password: "password123",
    host: "example.com",
  });

  expect(result).toEqual({
    success: false,
    message: "String error",
  });
});
