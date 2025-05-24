import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import TextBox from "./index";

describe("TextBoxコンポーネント", () => {
  test("デフォルトプロパティでレンダリングされる", () => {
    const onChange = vi.fn();
    render(<TextBox value="" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
    expect(input).not.toBeRequired();
  });

  test("カスタムプロパティでレンダリングされる", () => {
    const onChange = vi.fn();
    render(
      <TextBox
        type="email"
        placeholder="メールアドレスを入力"
        value="test@example.com"
        onChange={onChange}
        required
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("placeholder", "メールアドレスを入力");
    expect(input).toHaveValue("test@example.com");
    expect(input).toBeRequired();
  });

  test("値が変更された時にonChangeが呼ばれる", async () => {
    const onChange = vi.fn();
    render(<TextBox value="" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "a");

    expect(onChange).toHaveBeenCalled();
  });
});
