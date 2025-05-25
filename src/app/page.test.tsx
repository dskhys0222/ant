import * as hostService from "@/services/host";
import * as keyService from "@/services/key";
import * as tokenService from "@/services/token";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Home from "./page";

// Next.jsのuseRouterをモック
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// サービスをモック
vi.mock("@/services/host", () => ({
  getHost: vi.fn(),
}));

vi.mock("@/services/key", () => ({
  getUserKey: vi.fn(),
}));

vi.mock("@/services/token", () => ({
  getAccessToken: vi.fn(),
}));

// タイマーをモック
// vi.useFakeTimers(); // 各テスト内で設定する

describe("Homeページ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); // 各テスト前にフェイクタイマーを設定
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });
  test("タイトルが正しく表示される", () => {
    const getHostMock = vi.mocked(hostService.getHost);
    const getUserKeyMock = vi.mocked(keyService.getUserKey);
    const getAccessTokenMock = vi.mocked(tokenService.getAccessToken);

    getHostMock.mockReturnValue("");
    getUserKeyMock.mockReturnValue("");
    getAccessTokenMock.mockReturnValue("");

    render(<Home />);

    expect(screen.getByText("Ant App")).toBeInTheDocument();
  });
  test("ログイン状態の場合3秒後にタスクページにリダイレクトする", async () => {
    const getHostMock = vi.mocked(hostService.getHost);
    const getUserKeyMock = vi.mocked(keyService.getUserKey);
    const getAccessTokenMock = vi.mocked(tokenService.getAccessToken);

    getHostMock.mockReturnValue("example.com");
    getUserKeyMock.mockReturnValue("user-key");
    getAccessTokenMock.mockReturnValue("access-token");

    render(<Home />);

    // 3秒進める
    vi.advanceTimersByTime(3000);

    expect(mockPush).toHaveBeenCalledWith("/tasks");
  });
  test("未ログイン状態の場合3秒後にログインページにリダイレクトする", async () => {
    const getHostMock = vi.mocked(hostService.getHost);
    const getUserKeyMock = vi.mocked(keyService.getUserKey);
    const getAccessTokenMock = vi.mocked(tokenService.getAccessToken);

    getHostMock.mockReturnValue("");
    getUserKeyMock.mockReturnValue("");
    getAccessTokenMock.mockReturnValue("");

    render(<Home />);

    // 3秒進める
    vi.advanceTimersByTime(3000);

    expect(mockPush).toHaveBeenCalledWith("/login");
  });
  test("ホストのみ存在する場合はログインページにリダイレクトする", async () => {
    const getHostMock = vi.mocked(hostService.getHost);
    const getUserKeyMock = vi.mocked(keyService.getUserKey);
    const getAccessTokenMock = vi.mocked(tokenService.getAccessToken);

    getHostMock.mockReturnValue("example.com");
    getUserKeyMock.mockReturnValue("");
    getAccessTokenMock.mockReturnValue("");

    render(<Home />);

    vi.advanceTimersByTime(3000);

    expect(mockPush).toHaveBeenCalledWith("/login");
  });
  test("ユーザーキーのみ存在する場合はログインページにリダイレクトする", async () => {
    const getHostMock = vi.mocked(hostService.getHost);
    const getUserKeyMock = vi.mocked(keyService.getUserKey);
    const getAccessTokenMock = vi.mocked(tokenService.getAccessToken);

    getHostMock.mockReturnValue("");
    getUserKeyMock.mockReturnValue("user-key");
    getAccessTokenMock.mockReturnValue("");

    render(<Home />);

    vi.advanceTimersByTime(3000);

    expect(mockPush).toHaveBeenCalledWith("/login");
  });
  test("アクセストークンのみ存在する場合はログインページにリダイレクトする", async () => {
    const getHostMock = vi.mocked(hostService.getHost);
    const getUserKeyMock = vi.mocked(keyService.getUserKey);
    const getAccessTokenMock = vi.mocked(tokenService.getAccessToken);

    getHostMock.mockReturnValue("");
    getUserKeyMock.mockReturnValue("");
    getAccessTokenMock.mockReturnValue("access-token");

    render(<Home />);

    vi.advanceTimersByTime(3000);

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  test("コンポーネントがアンマウントされた場合タイマーがクリアされる", async () => {
    const { getHost } = await import("@/services/host");
    const { getUserKey } = await import("@/services/key");
    const { getAccessToken } = await import("@/services/token");

    vi.mocked(getHost).mockReturnValue("");
    vi.mocked(getUserKey).mockReturnValue("");
    vi.mocked(getAccessToken).mockReturnValue("");

    const { unmount } = render(<Home />);

    // コンポーネントをアンマウント
    unmount();

    // 3秒進めてもリダイレクトされないことを確認
    vi.advanceTimersByTime(3000);

    expect(mockPush).not.toHaveBeenCalled();
  });
});
