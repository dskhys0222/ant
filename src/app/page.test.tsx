import * as registrationService from "@/services/registrationService";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Home from "./page";
import useRegistration from "./page.hooks";

// registrationService のモック
vi.mock("@/services/registrationService");

describe("Homeコンポーネント", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("登録フォームが正しく表示される", () => {
    render(<Home />);

    // フォームコンポーネントの表示を確認
    expect(
      screen.getByRole("heading", { name: /ユーザー登録/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ホスト名")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("パスワード")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "登録" })).toBeInTheDocument();
  });

  test("入力値の変更ができる", () => {
    render(<Home />);

    const hostInput = screen.getByPlaceholderText("ホスト名");
    const usernameInput = screen.getByPlaceholderText("メールアドレス");
    const passwordInput = screen.getByPlaceholderText("パスワード");

    fireEvent.change(hostInput, { target: { value: "example.com" } });
    fireEvent.change(usernameInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(hostInput).toHaveValue("example.com");
    expect(usernameInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  test("送信ボタンクリック時にフォームが送信される", async () => {
    // モックの設定
    vi.spyOn(registrationService, "registerUser").mockResolvedValue({
      success: true,
      message: "登録が完了しました",
    });

    render(<Home />);

    const hostInput = screen.getByPlaceholderText("ホスト名");
    const usernameInput = screen.getByPlaceholderText("メールアドレス");
    const passwordInput = screen.getByPlaceholderText("パスワード");
    const button = screen.getByRole("button", { name: "登録" });

    // フォームに入力
    fireEvent.change(hostInput, { target: { value: "example.com" } });
    fireEvent.change(usernameInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // フォーム送信
    fireEvent.click(button);

    // 処理完了まで待機
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(registrationService.registerUser).toHaveBeenCalledWith({
      host: "example.com",
      username: "test@example.com",
      password: "password123",
    });
  });

  test("成功メッセージが表示される", async () => {
    // モックの設定
    vi.spyOn(registrationService, "registerUser").mockResolvedValue({
      success: true,
      message: "登録が完了しました",
    });

    render(<Home />);

    const hostInput = screen.getByPlaceholderText("ホスト名");
    const usernameInput = screen.getByPlaceholderText("メールアドレス");
    const passwordInput = screen.getByPlaceholderText("パスワード");
    const button = screen.getByRole("button", { name: "登録" });

    // フォームに入力
    fireEvent.change(hostInput, { target: { value: "example.com" } });
    fireEvent.change(usernameInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // フォーム送信
    fireEvent.click(button);

    // 成功メッセージの表示を確認
    expect(await screen.findByText("登録が完了しました")).toBeInTheDocument();
  });

  test("エラーメッセージが表示される", async () => {
    // エラーレスポンスのモック
    vi.spyOn(registrationService, "registerUser").mockResolvedValue({
      success: false,
      message: "ユーザー名が既に使用されています",
      status: 400,
    });

    render(<Home />);

    const hostInput = screen.getByPlaceholderText("ホスト名");
    const usernameInput = screen.getByPlaceholderText("メールアドレス");
    const passwordInput = screen.getByPlaceholderText("パスワード");
    const button = screen.getByRole("button", { name: "登録" });

    // フォームに入力
    fireEvent.change(hostInput, { target: { value: "example.com" } });
    fireEvent.change(usernameInput, {
      target: { value: "existinguser@example.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // フォーム送信
    fireEvent.click(button);

    // エラーメッセージの表示を確認
    expect(
      await screen.findByText("400 エラー: ユーザー名が既に使用されています"),
    ).toBeInTheDocument();
  });
});

describe("useRegistrationフック", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("空の値で初期化される", () => {
    const { result } = renderHook(() => useRegistration());

    expect(result.current.host).toBe("");
    expect(result.current.username).toBe("");
    expect(result.current.password).toBe("");
    expect(result.current.message).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  test("セッター関数が呼ばれた時に状態が更新される", () => {
    const { result } = renderHook(() => useRegistration());

    act(() => {
      result.current.setHost("example.com");
      result.current.setUsername("testuser");
      result.current.setPassword("password123");
    });

    expect(result.current.host).toBe("example.com");
    expect(result.current.username).toBe("testuser");
    expect(result.current.password).toBe("password123");
  });

  test("フォーム送信で成功レスポンスを処理する", async () => {
    // 成功レスポンスのモック
    vi.spyOn(registrationService, "registerUser").mockResolvedValue({
      success: true,
      message: "登録が完了しました",
    });

    const { result } = renderHook(() => useRegistration());

    // フォームデータをセット
    act(() => {
      result.current.setHost("example.com");
      result.current.setUsername("testuser");
      result.current.setPassword("password123");
    });

    // フォーム送信をシミュレート
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    // アサーション
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(registrationService.registerUser).toHaveBeenCalledWith({
      host: "example.com",
      username: "testuser",
      password: "password123",
    });
    expect(result.current.message).toBe("登録が完了しました");
    expect(result.current.isLoading).toBe(false);
  });

  test("フォーム送信でエラーレスポンスを処理する", async () => {
    // エラーレスポンスのモック
    vi.spyOn(registrationService, "registerUser").mockResolvedValue({
      success: false,
      message: "ユーザー名が既に使用されています",
      status: 400,
    });

    const { result } = renderHook(() => useRegistration());

    // フォームデータをセット
    act(() => {
      result.current.setHost("example.com");
      result.current.setUsername("existinguser");
      result.current.setPassword("password123");
    });

    // フォーム送信をシミュレート
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    // アサーション
    expect(result.current.message).toBe(
      "400 エラー: ユーザー名が既に使用されています",
    );
    expect(result.current.isLoading).toBe(false);
  });

  test("フォーム送信でネットワークエラーを処理する", async () => {
    // エラーレスポンスのモック（ステータスなし）
    vi.spyOn(registrationService, "registerUser").mockResolvedValue({
      success: false,
      message: "ネットワークエラー",
    });

    const { result } = renderHook(() => useRegistration());

    // フォーム送信をシミュレート
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    // アサーション
    expect(result.current.message).toBe(
      "エラーが発生しました: ネットワークエラー",
    );
    expect(result.current.isLoading).toBe(false);
  });

  test("予期しない例外を処理する", async () => {
    // 例外をスローするモック
    vi.spyOn(registrationService, "registerUser").mockImplementation(() => {
      throw new Error("予期せぬエラー");
    });

    const { result } = renderHook(() => useRegistration());

    // フォーム送信をシミュレート
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    // アサーション
    expect(result.current.message).toBe(
      "予期せぬエラーが発生しました: 予期せぬエラー",
    );
    expect(result.current.isLoading).toBe(false);
  });

  test("Error以外の例外を処理する", async () => {
    // 文字列例外をスローするモック
    vi.spyOn(registrationService, "registerUser").mockImplementation(() => {
      throw "文字列エラー";
    });

    const { result } = renderHook(() => useRegistration());

    // フォーム送信をシミュレート
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    // アサーション
    expect(result.current.message).toBe(
      "予期せぬエラーが発生しました: 文字列エラー",
    );
    expect(result.current.isLoading).toBe(false);
  });
});
