import { describe, expect, test } from "vitest";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  validateFormData,
} from "./index";

describe("isValidEmail", () => {
  test("正しいメールアドレスを検証する", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user.name+tag@example.co.jp")).toBe(true);
    expect(isValidEmail("user-name@domain.io")).toBe(true);
  });
  test("無効なメールアドレスを拒否する", () => {
    expect(isValidEmail("test@")).toBe(false);
    expect(isValidEmail("test@example")).toBe(false);
    expect(isValidEmail("testexample.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("test@example.")).toBe(false);
  });
});

describe("isValidPassword", () => {
  test("要件を満たすパスワードを検証する", () => {
    expect(isValidPassword("Password1!")).toBe(true);
    expect(isValidPassword("P@ssw0rd")).toBe(true);
    expect(isValidPassword("Complex123#")).toBe(true);
  });
  test("要件を満たさないパスワードを拒否する", () => {
    expect(isValidPassword("short1!")).toBe(false); // 短すぎる
    expect(isValidPassword("passwordonly")).toBe(false); // 数字と特殊文字なし
    expect(isValidPassword("password123")).toBe(false); // 特殊文字なし
    expect(isValidPassword("password!!!")).toBe(false); // 数字なし
  });
  test("カスタム最小長を尊重する", () => {
    expect(isValidPassword("Pass1!", 6)).toBe(true);
    expect(isValidPassword("Pa1!", 4)).toBe(true);
    expect(isValidPassword("Pa1!", 5)).toBe(false);
  });
});

describe("isValidUsername", () => {
  test("要件を満たすユーザー名を検証する", () => {
    expect(isValidUsername("user123")).toBe(true);
    expect(isValidUsername("user_name")).toBe(true);
    expect(isValidUsername("User_123")).toBe(true);
  });
  test("要件を満たさないユーザー名を拒否する", () => {
    expect(isValidUsername("us")).toBe(false); // 短すぎる
    expect(isValidUsername("user-name")).toBe(false); // 無効な文字
    expect(isValidUsername("user name")).toBe(false); // スペースを含む
    expect(isValidUsername("user@name")).toBe(false); // 特殊文字を含む
    expect(isValidUsername("a".repeat(21))).toBe(false); // 長すぎる
  });
  test("カスタム長さ境界を尊重する", () => {
    expect(isValidUsername("ab", 2, 10)).toBe(true);
    expect(isValidUsername("a", 2, 10)).toBe(false);
    expect(isValidUsername("user123456", 2, 10)).toBe(true);
    expect(isValidUsername("user1234567", 2, 10)).toBe(false);
  });
});

describe("validateFormData", () => {
  test("有効なデータに対してエラーなしを返す", () => {
    const data = {
      username: "validuser",
      email: "valid@example.com",
      password: "Valid123!",
    };
    const errors = validateFormData(data);
    expect(Object.keys(errors).length).toBe(0);
  });
  test("無効なデータに対して適切なエラーを返す", () => {
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
  test("提供されたフィールドのみを検証する", () => {
    const data = {
      username: "validuser",
      // email と password は省略
    };
    const errors = validateFormData(data);

    expect(Object.keys(errors).length).toBe(0);
  });
  test("メールが提供されていない場合は検証しない", () => {
    const data = {
      password: "Valid123!",
    };
    const errors = validateFormData(data);
    expect(Object.keys(errors).length).toBe(0);
  });
  test("パスワードが提供されていない場合は検証しない", () => {
    const data = {
      email: "valid@example.com",
    };
    const errors = validateFormData(data);
    expect(Object.keys(errors).length).toBe(0);
  });
  test("提供された全フィールドを検証する", () => {
    const data = {
      username: "invalid@user",
      email: "invalid",
      password: "weak",
    };
    const errors = validateFormData(data);

    expect(errors.username).toBe(
      "ユーザー名は3～20文字の英数字とアンダースコアのみ使用可能です",
    );
    expect(errors.email).toBe("有効なメールアドレスを入力してください");
    expect(errors.password).toBe(
      "パスワードは8文字以上で、数字と特殊文字を含む必要があります",
    );
  });
  test("空のオブジェクトを処理する", () => {
    const data = {};
    const errors = validateFormData(data);
    expect(Object.keys(errors).length).toBe(0);
  });
  test("空文字列値を処理する", () => {
    const data = {
      username: "",
      email: "",
      password: "",
    };
    const errors = validateFormData(data);
    expect(Object.keys(errors).length).toBe(0); // 空の文字列は検証されない
  });
});
