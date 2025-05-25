import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  getAccessToken,
  isExistsAccessToken,
  removeAccessToken,
  setAccessToken,
} from "./index";

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

describe("Tokenサービス", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAccessToken", () => {
    test("localStorageからトークンを取得する", () => {
      mockLocalStorage.getItem.mockReturnValue("stored-token");

      const result = getAccessToken();

      expect(result).toBe("stored-token");
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("access_token");
    });

    test("トークンが存在しない場合は空文字を返す", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = getAccessToken();

      expect(result).toBe("");
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("access_token");
    });

    test("サーバーサイド（window未定義）の場合は空文字を返す", () => {
      const originalWindow = global.window;
      // @ts-expect-error: Testing server-side behavior
      global.window = undefined;

      const result = getAccessToken();

      expect(result).toBe("");

      global.window = originalWindow;
    });
  });

  describe("setAccessToken", () => {
    test("localStorageにトークンを保存する", () => {
      setAccessToken("new-token");

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "access_token",
        "new-token",
      );
    });

    test("サーバーサイド（window未定義）の場合は何もしない", () => {
      const originalWindow = global.window;
      // @ts-expect-error: Testing server-side behavior
      global.window = undefined;

      setAccessToken("new-token");

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

      setAccessToken("new-token");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to set access token to localStorage:",
        error,
      );

      consoleSpy.mockRestore();
    });
  });

  describe("removeAccessToken", () => {
    test("localStorageからトークンを削除する", () => {
      removeAccessToken();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("access_token");
    });

    test("サーバーサイド（window未定義）の場合は何もしない", () => {
      const originalWindow = global.window;
      // @ts-expect-error: Testing server-side behavior
      global.window = undefined;

      removeAccessToken();

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();

      global.window = originalWindow;
    });
  });

  describe("isExistsAccessToken", () => {
    test("トークンが存在する場合はtrueを返す", () => {
      mockLocalStorage.getItem.mockReturnValue("existing-token");

      const result = isExistsAccessToken();

      expect(result).toBe(true);
    });

    test("トークンが空の場合はfalseを返す", () => {
      mockLocalStorage.getItem.mockReturnValue("");

      const result = isExistsAccessToken();

      expect(result).toBe(false);
    });

    test("トークンが空白のみの場合はfalseを返す", () => {
      mockLocalStorage.getItem.mockReturnValue("   ");

      const result = isExistsAccessToken();

      expect(result).toBe(false);
    });

    test("トークンがnullの場合はfalseを返す", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = isExistsAccessToken();

      expect(result).toBe(false);
    });
  });
});
