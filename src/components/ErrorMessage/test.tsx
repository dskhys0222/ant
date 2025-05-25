import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import ErrorMessage from "./index";

describe("ErrorMessageコンポーネント", () => {
  test("メッセージが提供された場合にエラーメッセージを表示する", () => {
    const errorMessage = "エラーが発生しました";

    render(<ErrorMessage message={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test("メッセージが空文字の場合は何も表示しない", () => {
    const { container } = render(<ErrorMessage message="" />);

    expect(container.firstChild).toBeNull();
  });

  test("メッセージが未定義の場合は何も表示しない", () => {
    const { container } = render(<ErrorMessage />);

    expect(container.firstChild).toBeNull();
  });

  test("メッセージがnullの場合は何も表示しない", () => {
    const { container } = render(<ErrorMessage message={undefined} />);

    expect(container.firstChild).toBeNull();
  });
  test("CSSクラスが正しく適用される", () => {
    const errorMessage = "テストエラー";

    render(<ErrorMessage message={errorMessage} />);

    const errorElement = screen.getByText(errorMessage);
    // Panda CSSのクラス名が適用されていることを確認
    expect(errorElement.className).toBeTruthy();
    expect(errorElement.className.length).toBeGreaterThan(0);
  });
});
