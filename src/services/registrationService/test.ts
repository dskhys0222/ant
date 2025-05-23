import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerUser } from "./index";
import * as hashModule from "@/utils/hash";

// fetch のモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("registrationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // hash 関数をモック化
    vi.spyOn(hashModule, "hash").mockImplementation(async (password) => {
      return `hashed_${password}`;
    });
  });

  it("should register user successfully", async () => {
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

  it("should handle registration error", async () => {
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

  it("should handle network errors", async () => {
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
});
