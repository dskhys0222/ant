import { describe, it, expect, test } from "vitest";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  validateFormData,
} from "./index";

test("Validation Utilities", () => {
  describe("isValidEmail", () => {
    it("should validate correct email addresses", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name+tag@example.co.jp")).toBe(true);
      expect(isValidEmail("user-name@domain.io")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(isValidEmail("test@")).toBe(false);
      expect(isValidEmail("test@example")).toBe(false);
      expect(isValidEmail("testexample.com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail("test@example.")).toBe(false);
    });
  });

  describe("isValidPassword", () => {
    it("should validate passwords meeting requirements", () => {
      expect(isValidPassword("Password1!")).toBe(true);
      expect(isValidPassword("P@ssw0rd")).toBe(true);
      expect(isValidPassword("Complex123#")).toBe(true);
    });

    it("should reject passwords not meeting requirements", () => {
      expect(isValidPassword("short1!")).toBe(false); // 短すぎる
      expect(isValidPassword("passwordonly")).toBe(false); // 数字と特殊文字なし
      expect(isValidPassword("password123")).toBe(false); // 特殊文字なし
      expect(isValidPassword("password!!!")).toBe(false); // 数字なし
    });

    it("should respect custom minimum length", () => {
      expect(isValidPassword("Pass1!", 6)).toBe(true);
      expect(isValidPassword("Pa1!", 4)).toBe(true);
      expect(isValidPassword("Pa1!", 5)).toBe(false);
    });
  });

  describe("isValidUsername", () => {
    it("should validate usernames meeting requirements", () => {
      expect(isValidUsername("user123")).toBe(true);
      expect(isValidUsername("user_name")).toBe(true);
      expect(isValidUsername("User_123")).toBe(true);
    });

    it("should reject usernames not meeting requirements", () => {
      expect(isValidUsername("us")).toBe(false); // 短すぎる
      expect(isValidUsername("user-name")).toBe(false); // 無効な文字
      expect(isValidUsername("user name")).toBe(false); // スペースを含む
      expect(isValidUsername("user@name")).toBe(false); // 特殊文字を含む
      expect(isValidUsername("a".repeat(21))).toBe(false); // 長すぎる
    });

    it("should respect custom length bounds", () => {
      expect(isValidUsername("ab", 2, 10)).toBe(true);
      expect(isValidUsername("a", 2, 10)).toBe(false);
      expect(isValidUsername("user123456", 2, 10)).toBe(true);
      expect(isValidUsername("user1234567", 2, 10)).toBe(false);
    });
  });

  describe("validateFormData", () => {
    it("should return no errors for valid data", () => {
      const data = {
        username: "validuser",
        email: "valid@example.com",
        password: "Valid123!",
      };
      const errors = validateFormData(data);
      expect(Object.keys(errors).length).toBe(0);
    });

    it("should return appropriate errors for invalid data", () => {
      const data = {
        username: "u$er",
        email: "invalid-email",
        password: "short",
      };
      const errors = validateFormData(data);

      expect(errors.username).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    });

    it("should only validate fields that are provided", () => {
      const data = {
        username: "validuser",
        // email と password は省略
      };
      const errors = validateFormData(data);

      expect(Object.keys(errors).length).toBe(0);
    });
  });
});
