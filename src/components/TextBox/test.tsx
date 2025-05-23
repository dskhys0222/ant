import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TextBox from "./index";

describe("TextBox", () => {
  it("renders with default props", () => {
    const onChange = vi.fn();
    render(<TextBox value="" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
    expect(input).not.toBeRequired();
  });

  it("renders with custom props", () => {
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

  it("calls onChange when value changes", async () => {
    const onChange = vi.fn();
    render(<TextBox value="" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "a");

    expect(onChange).toHaveBeenCalled();
  });
});
