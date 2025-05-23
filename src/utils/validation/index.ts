/**
 * フォームバリデーションユーティリティ
 */

/**
 * メールアドレスが有効かどうかを検証する
 * @param email 検証するメールアドレス
 * @returns 有効な場合はtrue、そうでない場合はfalse
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * パスワードが最低限の要件を満たしているかどうかを検証する
 * @param password 検証するパスワード
 * @param minLength 最小文字数（デフォルト: 8）
 * @returns 有効な場合はtrue、そうでない場合はfalse
 */
export function isValidPassword(password: string, minLength = 8): boolean {
  if (password.length < minLength) {
    return false;
  }

  // 少なくとも1つの数字を含むか
  const hasNumber = /\d/.test(password);
  // 少なくとも1つの特殊文字を含むか
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return hasNumber && hasSpecialChar;
}

/**
 * ユーザー名が有効かどうかを検証する
 * @param username 検証するユーザー名
 * @param minLength 最小文字数（デフォルト: 3）
 * @param maxLength 最大文字数（デフォルト: 20）
 * @returns 有効な場合はtrue、そうでない場合はfalse
 */
export function isValidUsername(
  username: string,
  minLength = 3,
  maxLength = 20,
): boolean {
  if (username.length < minLength || username.length > maxLength) {
    return false;
  }

  // 英数字とアンダースコアのみを許可
  const validCharsRegex = /^[a-zA-Z0-9_]+$/;
  return validCharsRegex.test(username);
}

/**
 * フォームデータのバリデーションエラーを返す
 * @param data 検証するデータオブジェクト
 * @returns エラーメッセージのオブジェクト。エラーがない場合は空のオブジェクト
 */
export function validateFormData(
  data: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (data.username && !isValidUsername(data.username)) {
    errors.username =
      "ユーザー名は3～20文字の英数字とアンダースコアのみ使用可能です";
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = "有効なメールアドレスを入力してください";
  }

  if (data.password && !isValidPassword(data.password)) {
    errors.password =
      "パスワードは8文字以上で、数字と特殊文字を含む必要があります";
  }

  return errors;
}
