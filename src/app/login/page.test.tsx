import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Login from "./page";

// Next.jsのuseRouterとLinkをモック
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({
      children,
      href,
    }: { children: React.ReactNode; href: string }) => (
      <a href={href}>{children}</a>
    ),
  };
});

// サービスをモック
vi.mock("@/services/host", () => ({
  setHost: vi.fn(),
}));

vi.mock("@/services/user", () => ({
  login: vi.fn(),
}));

describe("Loginページ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("ログインフォームが正しくレンダリングされる", () => {
    render(<Login />);

    // ページタイトルのテキストを確認
    expect(screen.getAllByText("ログイン")).toHaveLength(2); // テキストとボタンの両方
    expect(screen.getByLabelText("ホスト名")).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ログイン" }),
    ).toBeInTheDocument();
    expect(screen.getByText("新規登録")).toBeInTheDocument();
  });

  test("入力フィールドに値を入力できる", () => {
    render(<Login />);

    const hostInput = screen.getByLabelText("ホスト名") as HTMLInputElement;
    const usernameInput = screen.getByLabelText(
      "メールアドレス",
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      "パスワード",
    ) as HTMLInputElement;

    fireEvent.change(hostInput, { target: { value: "example.com" } });
    fireEvent.change(usernameInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(hostInput.value).toBe("example.com");
    expect(usernameInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  test("正常なログインが成功する", async () => {
    const { login } = await import("@/services/user");
    vi.mocked(login).mockResolvedValue({
      success: true,
      message: "ログイン成功",
    });

    render(<Login />);

    const hostInput = screen.getByLabelText("ホスト名");
    const usernameInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "ログイン" });

    fireEvent.change(hostInput, { target: { value: "example.com" } });
    fireEvent.change(usernameInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(submitButton);

    expect(screen.getByText("ログイン中...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("ログイン成功")).toBeInTheDocument();
    });

    expect(mockPush).toHaveBeenCalledWith("/tasks");
  });

  test("ログイン失敗時にエラーメッセージを表示する", async () => {
    const { login } = await import("@/services/user");
    vi.mocked(login).mockResolvedValue({
      success: false,
      message: "認証に失敗しました",
      status: 401,
    });

    render(<Login />);

    const hostInput = screen.getByLabelText("ホスト名");
    const usernameInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "ログイン" });

    fireEvent.change(hostInput, { target: { value: "example.com" } });
    fireEvent.change(usernameInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("401 エラー: 認証に失敗しました"),
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  test("バリデーションエラーの場合はエラーメッセージを表示する", async () => {
    render(<Login />);

    const submitButton = screen.getByRole("button", { name: "ログイン" });

    // 空の状態で送信
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText("有効なメールアドレスを入力してください"),
      ).toBeInTheDocument();
      expect(screen.getByText("パスワードは必須です")).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  test("ネットワークエラーの場合は予期せぬエラーメッセージを表示する", async () => {
    const { login } = await import("@/services/user");
    vi.mocked(login).mockResolvedValue({
      success: false,
      message: "予期せぬエラーが発生しました: Network error",
    });

    render(<Login />);

    const hostInput = screen.getByLabelText("ホスト名");
    const usernameInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "ログイン" });

    fireEvent.change(hostInput, { target: { value: "example.com" } });
    fireEvent.change(usernameInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "エラーが発生しました: 予期せぬエラーが発生しました: Network error",
        ),
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  test("新規登録リンクが正しく設定されている", () => {
    render(<Login />);

    const registerLink = screen.getByText("新規登録");
    expect(registerLink.closest("a")).toHaveAttribute("href", "/register");
  });

  test("ステータスなしでログイン失敗した場合のエラーメッセージ", async () => {
    const { login } = await import("@/services/user");
    vi.mocked(login).mockResolvedValue({
      success: false,
      message: "サーバーエラー",
    });

    render(<Login />);

    const hostInput = screen.getByLabelText("ホスト名");
    const usernameInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button", { name: "ログイン" });

    fireEvent.change(hostInput, { target: { value: "example.com" } });
    fireEvent.change(usernameInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("エラーが発生しました: サーバーエラー"),
      ).toBeInTheDocument();
    });
  });
});
