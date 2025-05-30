import * as hostService from "@/services/host";
import * as userService from "@/services/user";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import Home from "./page";
import useRegister from "./page.hooks";

// registrationService のモック
vi.mock("@/services/registrationService");

// Next.js router のモック
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockPush.mockClear();
  // hostサービスのモック
  vi.spyOn(hostService, "setHost").mockReturnValue(true);
});

test("登録フォームが正しく表示される", () => {
  render(<Home />);

  // フォームコンポーネントの表示を確認
  expect(screen.getByText("ユーザー登録")).toBeInTheDocument();
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
  vi.spyOn(userService, "register").mockResolvedValue({
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

  expect(userService.register).toHaveBeenCalledWith({
    username: "test@example.com",
    password: "password123",
  });
});

test("成功メッセージが表示される", async () => {
  // モックの設定
  vi.spyOn(userService, "register").mockResolvedValue({
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
  vi.spyOn(userService, "register").mockResolvedValue({
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

test("空の値で初期化される", () => {
  const { result } = renderHook(() => useRegister());

  expect(result.current.host).toBe("");
  expect(result.current.username).toBe("");
  expect(result.current.password).toBe("");
  expect(result.current.message).toBe("");
  expect(result.current.isLoading).toBe(false);
});

test("セッター関数が呼ばれた時に状態が更新される", () => {
  const { result } = renderHook(() => useRegister());

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
  vi.spyOn(userService, "register").mockResolvedValue({
    success: true,
    message: "登録が完了しました",
  });

  const { result } = renderHook(() => useRegister());

  // フォームデータをセット
  act(() => {
    result.current.setHost("example.com");
    result.current.setUsername("testuser@example.com");
    result.current.setPassword("password123");
  });

  // フォーム送信をシミュレート
  const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

  await act(async () => {
    await result.current.handleSubmit(mockEvent);
  });

  // アサーション
  expect(mockEvent.preventDefault).toHaveBeenCalled();
  expect(userService.register).toHaveBeenCalledWith({
    username: "testuser@example.com",
    password: "password123",
  });
  expect(result.current.message).toBe("登録が完了しました");
  expect(result.current.isLoading).toBe(false);
});

test("フォーム送信でエラーレスポンスを処理する", async () => {
  // エラーレスポンスのモック
  vi.spyOn(userService, "register").mockResolvedValue({
    success: false,
    message: "ユーザー名が既に使用されています",
    status: 400,
  });

  const { result } = renderHook(() => useRegister());

  // フォームデータをセット
  act(() => {
    result.current.setHost("example.com");
    result.current.setUsername("existinguser@example.com");
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
  vi.spyOn(userService, "register").mockResolvedValue({
    success: false,
    message: "ネットワークエラー",
  });

  const { result } = renderHook(() => useRegister());

  // フォームデータをセット
  act(() => {
    result.current.setHost("example.com");
    result.current.setUsername("testuser@example.com");
    result.current.setPassword("password123");
  });

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
  vi.spyOn(userService, "register").mockImplementation(() => {
    throw new Error("予期せぬエラー");
  });

  const { result } = renderHook(() => useRegister());

  // フォームデータをセット
  act(() => {
    result.current.setHost("example.com");
    result.current.setUsername("testuser@example.com");
    result.current.setPassword("password123");
  });

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
  vi.spyOn(userService, "register").mockImplementation(() => {
    throw "文字列エラー";
  });

  const { result } = renderHook(() => useRegister());

  // フォームデータをセット
  act(() => {
    result.current.setHost("example.com");
    result.current.setUsername("testuser@example.com");
    result.current.setPassword("password123");
  });

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

test("useRegister - バリデーションエラーの処理", async () => {
  const { result } = renderHook(() => useRegister());

  // 無効なデータをセット（空のユーザー名とパスワード）
  act(() => {
    result.current.setHost("example.com");
    result.current.setUsername(""); // 空のユーザー名
    result.current.setPassword(""); // 空のパスワード
  });

  // フォーム送信をシミュレート
  const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

  await act(async () => {
    await result.current.handleSubmit(mockEvent);
  });

  // バリデーションエラーが設定されることを確認
  expect(result.current.validationErrors).toEqual(
    expect.objectContaining({
      username: expect.any(String),
      password: expect.any(String),
    }),
  );
  expect(result.current.isLoading).toBe(false);

  // userServiceのregisterが呼ばれないことを確認
  expect(userService.register).not.toHaveBeenCalled();
});

test("useRegister - 登録失敗時のstatusなしエラー", async () => {
  // register サービスをモック（statusなしのエラー）
  vi.spyOn(userService, "register").mockResolvedValue({
    success: false,
    message: "登録に失敗しました",
    // statusプロパティなし
  });

  const { result } = renderHook(() => useRegister());

  // フォームデータをセット
  act(() => {
    result.current.setHost("example.com");
    result.current.setUsername("testuser@example.com");
    result.current.setPassword("password123");
  });

  // フォーム送信をシミュレート
  const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

  await act(async () => {
    await result.current.handleSubmit(mockEvent);
  });

  // アサーション（statusなしのエラーメッセージ）
  expect(result.current.message).toBe(
    "エラーが発生しました: 登録に失敗しました",
  );
  expect(result.current.isLoading).toBe(false);
  expect(mockPush).not.toHaveBeenCalled();
});
