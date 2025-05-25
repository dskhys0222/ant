import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  generateUserKey,
  getUserKey,
  isExistsUserKey,
  removeUserKey,
  setUserKey,
} from "./index";

// ハッシュユーティリティのモック
vi.mock("@/utils/hash", () => ({
  hash: vi.fn(),
}));

// localStorageのモック
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("Keyサービス", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateUserKey", () => {
    test("正常にユーザーキーを生成する", async () => {
      const { hash } = await import("@/utils/hash");
      vi.mocked(hash).mockResolvedValue("generated-hash");

      const result = await generateUserKey("test@example.com", "password123");

      expect(result).toBe("generated-hash");
      expect(hash).toHaveBeenCalledWith(
        "password123",
        "SHA-512",
        "test@example.com",
      );
    });

    test("ユーザー名が空の場合はエラーを投げる", async () => {
      await expect(generateUserKey("", "password123")).rejects.toThrow(
        "Username and password must be provided",
      );
    });

    test("パスワードが空の場合はエラーを投げる", async () => {
      await expect(generateUserKey("test@example.com", "")).rejects.toThrow(
        "Username and password must be provided",
      );
    });

    test("ユーザー名とパスワードが両方空の場合はエラーを投げる", async () => {
      await expect(generateUserKey("", "")).rejects.toThrow(
        "Username and password must be provided",
      );
    });
  });

  describe("getUserKey", () => {
    test("localStorageからキーを取得する", () => {
      mockLocalStorage.getItem.mockReturnValue("stored-key");

      const result = getUserKey();

      expect(result).toBe("stored-key");
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("user_key");
    });

    test("キーが存在しない場合は空文字を返す", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = getUserKey();

      expect(result).toBe("");
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("user_key");
    });

    test("サーバーサイド（window未定義）の場合は空文字を返す", () => {
      const originalWindow = global.window;
      // @ts-expect-error: Testing server-side behavior
      global.window = undefined;

      const result = getUserKey();

      expect(result).toBe("");

      global.window = originalWindow;
    });
  });

  describe("setUserKey", () => {
    test("localStorageにキーを保存する", () => {
      setUserKey("new-key");

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "user_key",
        "new-key",
      );
    });

    test("サーバーサイド（window未定義）の場合は何もしない", () => {
      const originalWindow = global.window;
      // @ts-expect-error: Testing server-side behavior
      global.window = undefined;

      setUserKey("new-key");

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

      global.window = originalWindow;
    });

    test("localStorage.setItemでエラーが発生した場合はコンソールエラーを出力する", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Storage error");
      mockLocalStorage.setItem.mockImplementation(() => {
        throw error;
      });

      setUserKey("new-key");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to set user key to localStorage:",
        error,
      );

      consoleSpy.mockRestore();
    });
  });

  describe("removeUserKey", () => {
    test("localStorageからキーを削除する", () => {
      removeUserKey();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("user_key");
    });

    test("サーバーサイド（window未定義）の場合は何もしない", () => {
      const originalWindow = global.window;
      // @ts-expect-error: Testing server-side behavior
      global.window = undefined;

      removeUserKey();

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();

      global.window = originalWindow;
    });
  });

  describe("isExistsUserKey", () => {
    test("キーが存在する場合はtrueを返す", () => {
      mockLocalStorage.getItem.mockReturnValue("existing-key");

      const result = isExistsUserKey();

      expect(result).toBe(true);
    });

    test("キーが空の場合はfalseを返す", () => {
      mockLocalStorage.getItem.mockReturnValue("");

      const result = isExistsUserKey();

      expect(result).toBe(false);
    });

    test("キーが空白のみの場合はfalseを返す", () => {
      mockLocalStorage.getItem.mockReturnValue("   ");

      const result = isExistsUserKey();

      expect(result).toBe(false);
    });

    test("キーがnullの場合はfalseを返す", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = isExistsUserKey();

      expect(result).toBe(false);
    });
  });
});
