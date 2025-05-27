import { describe, expect, test, vi } from "vitest";
import { decryptObject, encryptObject } from "./index";

describe("crypto utilities", () => {
  const testPassword = "TestPassword123!";
  const testObject = {
    name: "John Doe",
    age: 30,
    email: "john@example.com",
    preferences: {
      theme: "light",
      notifications: true,
    },
  };

  describe("encryptObject and decryptObject", () => {
    test("should encrypt and decrypt an object successfully", async () => {
      const encrypted = await encryptObject(testObject, testPassword);
      const decrypted = await decryptObject<typeof testObject>(
        encrypted,
        testPassword,
      );

      expect(decrypted).toEqual(testObject);
    });
    test("should produce different encrypted data for the same object", async () => {
      const encrypted1 = await encryptObject(testObject, testPassword);
      const encrypted2 = await encryptObject(testObject, testPassword);

      // IVとsaltがランダムなので、暗号化結果は毎回異なる
      expect(encrypted1).not.toBe(encrypted2);
    });

    test("should fail to decrypt with wrong password", async () => {
      const encrypted = await encryptObject(testObject, testPassword);

      await expect(
        decryptObject(encrypted, "WrongPassword123!"),
      ).rejects.toThrow("復号化に失敗しました");
    });

    test("should handle different data types", async () => {
      const testCases = [
        "simple string",
        123,
        true,
        null,
        [1, 2, 3, "array"],
        { nested: { deeply: { value: "test" } } },
      ];

      for (const testCase of testCases) {
        const encrypted = await encryptObject(testCase, testPassword);
        const decrypted = await decryptObject(encrypted, testPassword);
        expect(decrypted).toEqual(testCase);
      }
    });
  });

  describe("error handling", () => {
    test("should handle encryption errors gracefully", async () => {
      // crypto.subtle.encrypt をモックしてエラーを発生させる
      const originalEncrypt = crypto.subtle.encrypt;
      vi.spyOn(crypto.subtle, "encrypt").mockRejectedValueOnce(
        new Error("暗号化エラー"),
      );

      await expect(encryptObject(testObject, testPassword)).rejects.toThrow(
        "暗号化に失敗しました",
      );

      // モックを復元
      crypto.subtle.encrypt = originalEncrypt;
    });

    test("should handle non-Error exceptions in encryption", async () => {
      // crypto.subtle.encrypt をモックして Error以外の例外を発生させる
      const originalEncrypt = crypto.subtle.encrypt;
      vi.spyOn(crypto.subtle, "encrypt").mockRejectedValueOnce(
        "Unexpected encryption failure",
      );

      await expect(encryptObject(testObject, testPassword)).rejects.toThrow(
        "暗号化に失敗しました: 不明なエラー",
      );

      // モックを復元
      crypto.subtle.encrypt = originalEncrypt;
    });

    test("should handle non-Error exceptions in decryption", async () => {
      const encrypted = await encryptObject(testObject, testPassword);

      // crypto.subtle.decrypt をモックして Error以外の例外を発生させる
      const originalDecrypt = crypto.subtle.decrypt;
      vi.spyOn(crypto.subtle, "decrypt").mockRejectedValueOnce(
        "Unexpected decryption failure",
      );

      await expect(decryptObject(encrypted, testPassword)).rejects.toThrow(
        "復号化に失敗しました: 不明なエラー",
      );

      // モックを復元
      crypto.subtle.decrypt = originalDecrypt;
    });

    test("should handle corrupted encrypted data", async () => {
      const encrypted = await encryptObject(testObject, testPassword);

      // データを破損させる（正しい形式だが中身を変更）
      const parts = encrypted.split(":");
      const corruptedData = `${parts[0]}:${parts[1]}:corrupted_data`;

      await expect(decryptObject(corruptedData, testPassword)).rejects.toThrow(
        "復号化に失敗しました",
      );
    });
    test("should handle invalid encrypted data format", async () => {
      // 無効な形式のデータ（:で区切られた部分が3つ未満）
      const invalidData1 = "invalid_data";
      const invalidData2 = "part1:part2"; // 2つの部分のみ

      await expect(decryptObject(invalidData1, testPassword)).rejects.toThrow(
        "復号化に失敗しました",
      );

      await expect(decryptObject(invalidData2, testPassword)).rejects.toThrow(
        "復号化に失敗しました",
      );
    });
  });
});
