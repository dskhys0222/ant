/**
 * ホスト名管理サービスのテスト
 */

import { afterEach, beforeEach, describe, expect, test } from "vitest";
import * as HostService from "./index";

// LocalStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Hostサービス", () => {
  beforeEach(() => {
    // テスト前にLocalStorageをクリア
    localStorageMock.clear();
  });

  describe("get", () => {
    test("保存されていない場合は空文字列を返す", () => {
      expect(HostService.getHost()).toBe("");
    });

    test("保存されているホスト名を取得できる", () => {
      localStorageMock.setItem("app_hostname", "example.com");
      expect(HostService.getHost()).toBe("example.com");
    });
  });

  describe("set", () => {
    test("有効なホスト名を保存できる", () => {
      expect(() => HostService.setHost("example.com")).not.toThrow();
      expect(HostService.getHost()).toBe("example.com");
    });

    test("有効なIPアドレスを保存できる", () => {
      expect(() => HostService.setHost("192.168.1.1")).not.toThrow();
      expect(HostService.getHost()).toBe("192.168.1.1");
    });

    test("無効なホスト名でエラーを投げる", () => {
      expect(() => HostService.setHost("")).toThrow("無効なホスト名です");
      expect(() => HostService.setHost("invalid..hostname")).toThrow(
        "無効なホスト名です",
      );
      expect(() => HostService.setHost("-invalid.hostname")).toThrow(
        "無効なホスト名です",
      );
    });

    test("無効なIPアドレスでエラーを投げる", () => {
      expect(() => HostService.setHost("999.999.999.999")).toThrow(
        "無効なホスト名です",
      );
      expect(() => HostService.setHost("192.168.1")).toThrow(
        "無効なホスト名です",
      );
    });
  });

  describe("clear", () => {
    test("保存されているホスト名を削除できる", () => {
      HostService.setHost("example.com");
      expect(HostService.getHost()).toBe("example.com");

      HostService.clearHost();
      expect(HostService.getHost()).toBe("");
    });
  });

  describe("exists", () => {
    test("ホスト名が保存されていない場合はfalseを返す", () => {
      expect(HostService.isExistsHost()).toBe(false);
    });

    test("ホスト名が保存されている場合はtrueを返す", () => {
      HostService.setHost("example.com");
      expect(HostService.isExistsHost()).toBe(true);
    });

    test("空文字列が保存されている場合はfalseを返す", () => {
      localStorageMock.setItem("app_hostname", "");
      expect(HostService.isExistsHost()).toBe(false);
    });
  });

  describe("サーバーサイド環境（window未定義）", () => {
    const originalWindow = global.window;

    beforeEach(() => {
      // @ts-ignore
      global.window = undefined;
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    test("getHost は空文字列を返す", () => {
      expect(HostService.getHost()).toBe("");
    });

    test("setHost は false を返す", () => {
      expect(HostService.setHost("example.com")).toBe(false);
    });

    test("clearHost は何もしない", () => {
      expect(() => HostService.clearHost()).not.toThrow();
    });

    test("isExistsHost は false を返す", () => {
      expect(HostService.isExistsHost()).toBe(false);
    });
  });

  describe("ストレージエラー", () => {
    test("setHost でストレージエラーが発生した場合は false を返す", () => {
      // localStorage.setItem でエラーを発生させる
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = () => {
        throw new Error("Storage quota exceeded");
      };

      const result = HostService.setHost("example.com");
      expect(result).toBe(false);

      // 元に戻す
      localStorageMock.setItem = originalSetItem;
    });
  });
});
