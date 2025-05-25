import * as hostModule from "@/services/host";
import * as keyModule from "@/services/key";
import * as tokenModule from "@/services/token";
import * as hashModule from "@/utils/hash";
import { beforeEach, expect, test, vi } from "vitest";
import { login, register } from "./index";

// fetch のモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();

  // hash 関数をモック化
  vi.spyOn(hashModule, "hash").mockImplementation(async (password) => {
    return `hashed_${password}`;
  });

  // getHost 関数をモック化
  vi.spyOn(hostModule, "getHost").mockReturnValue("example.com");

  // その他のサービス関数をモック化
  vi.spyOn(keyModule, "generateUserKey").mockResolvedValue("user-key");
  vi.spyOn(keyModule, "setUserKey").mockImplementation(() => {});
  vi.spyOn(tokenModule, "setAccessToken").mockImplementation(() => {});
});

test("ユーザー登録が成功する", async () => {
  // 成功レスポンスのモック
  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => "登録が完了しました",
    })
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token: "test-token" }),
    });

  const result = await register({
    username: "testuser@example.com",
    password: "password123",
  });

  expect(mockFetch).toHaveBeenCalledWith(
    "https://example.com/public/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser@example.com",
        password: "hashed_password123",
      }),
    },
  );

  expect(result).toEqual({
    success: true,
    message: "登録が完了しました",
    status: 200,
  });
});

test("登録エラーを処理する", async () => {
  // エラーレスポンスのモック
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 400,
    text: async () => "ユーザー名が既に使用されています",
  });

  const result = await register({
    username: "existinguser@example.com",
    password: "password123",
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

  const result = await register({
    username: "testuser@example.com",
    password: "password123",
  });

  expect(result).toEqual({
    success: false,
    message: "ネットワークエラー",
  });
});

test("標準外のエラーレスポンス形式を処理する", async () => {
  // エラーレスポンスでJSONがない場合のモック
  mockFetch.mockRejectedValueOnce(new Error("Invalid JSON"));

  const result = await register({
    username: "testuser@example.com",
    password: "password123",
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

  const result = await register({
    username: "testuser@example.com",
    password: "password123",
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

  const result = await register({
    username: "testuser@example.com",
    password: "password123",
  });

  expect(result).toEqual({
    success: false,
    message: "String error",
  });
});

test("Error以外の例外を処理する", async () => {
  // 文字列の例外をthrow
  mockFetch.mockRejectedValueOnce("Unknown error");

  const result = await register({
    username: "testuser@example.com",
    password: "password123",
  });

  expect(result).toEqual({
    success: false,
    message: "Unknown error",
  });
});

test("ログインが成功する", async () => {
  // 成功レスポンスのモック
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({ token: "access-token-123" }),
  });

  const result = await login({
    username: "testuser@example.com",
    password: "password123",
  });

  expect(result).toEqual({
    success: true,
    message: "ログインに成功しました",
    status: 200,
  });

  // setAccessToken と setUserKey が呼ばれることを確認
  expect(tokenModule.setAccessToken).toHaveBeenCalledWith("access-token-123");
  expect(keyModule.setUserKey).toHaveBeenCalledWith("user-key");
});

test("ログインが失敗する", async () => {
  // 失敗レスポンスのモック
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 401,
    text: async () => "Invalid credentials",
  });

  const result = await login({
    username: "testuser@example.com",
    password: "wrongpassword",
  });

  expect(result).toEqual({
    success: false,
    message: "Invalid credentials",
    status: 401,
  });

  // トークンやキーは設定されないことを確認
  expect(tokenModule.setAccessToken).not.toHaveBeenCalled();
  expect(keyModule.setUserKey).not.toHaveBeenCalled();
});

test("ログインでバリデーションエラーが発生する", async () => {
  const result = await login({
    username: "", // 空のユーザー名
    password: "password123",
  });

  expect(result.success).toBe(false);
  expect(result.message).toContain("有効なメールアドレスを入力してください");

  // fetchが呼ばれていないことを確認
  expect(mockFetch).not.toHaveBeenCalled();
});

test("ログインでネットワークエラーが発生する", async () => {
  mockFetch.mockRejectedValueOnce(new Error("Network error"));

  const result = await login({
    username: "testuser@example.com",
    password: "password123",
  });

  expect(result).toEqual({
    success: false,
    message: "Network error",
  });
});

test("登録でバリデーションエラーが発生する", async () => {
  const result = await register({
    username: "", // 空のユーザー名
    password: "password123",
  });

  expect(result.success).toBe(false);
  expect(result.message).toContain("有効なメールアドレスを入力してください");

  // fetchが呼ばれていないことを確認
  expect(mockFetch).not.toHaveBeenCalled();
});

test("登録でError以外の例外が発生する", async () => {
  mockFetch.mockRejectedValueOnce("文字列エラー");

  const result = await register({
    username: "testuser@example.com",
    password: "password123",
  });

  expect(result).toEqual({
    success: false,
    message: "文字列エラー",
  });
});

test("ログインでError以外の例外が発生する", async () => {
  mockFetch.mockRejectedValueOnce(12345);

  const result = await login({
    username: "testuser@example.com",
    password: "password123",
  });

  expect(result).toEqual({
    success: false,
    message: "12345",
  });
});
