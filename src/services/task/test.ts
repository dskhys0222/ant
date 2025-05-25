import { beforeEach, describe, expect, test, vi } from "vitest";
import { createTask, deleteTask, fetchTasks, updateTask } from "./index";
import type { TaskData } from "./types";

// モジュールのモック
vi.mock("@/services/host", () => ({
  getHost: vi.fn().mockReturnValue("example.com"),
}));

vi.mock("@/services/token", () => ({
  getAccessToken: vi.fn(),
}));

vi.mock("@/services/key", () => ({
  getUserKey: vi.fn().mockReturnValue("mock-key"),
}));

vi.mock("@/utils/crypto", () => ({
  encryptObject: vi.fn().mockResolvedValue("encrypted-data"),
  decryptObject: vi
    .fn()
    .mockResolvedValue({ title: "Test Task", description: "Test Description" }),
}));

// グローバルfetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Taskサービス", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchTasks", () => {
    test("トークンがない場合はエラーを返す", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("");

      const result = await fetchTasks();

      expect(result).toEqual({
        success: false,
        message: "No token",
      });
    });

    test("正常にタスクを取得できる", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      const mockTasks = [
        {
          _id: "1",
          username: "test@example.com",
          encryptedData: "encrypted-data",
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockTasks),
      });

      const result = await fetchTasks();

      expect(result).toEqual({
        success: true,
        status: 200,
        data: [
          {
            title: "Test Task",
            description: "Test Description",
            _id: "1",
          },
        ],
      });

      expect(mockFetch).toHaveBeenCalledWith("https://example.com/auth/tasks", {
        headers: { Authorization: "Bearer mock-token" },
      });
    });

    test("API呼び出しが失敗した場合はエラーを返す", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue("Bad Request"),
      });

      const result = await fetchTasks();

      expect(result).toEqual({
        success: false,
        message: "Bad Request",
        status: 400,
      });
    });

    test("ネットワークエラーの場合はエラーを返す", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await fetchTasks();

      expect(result).toEqual({
        success: false,
        message: "Network error",
      });
    });
  });

  describe("createTask", () => {
    const mockTask: TaskData = {
      title: "New Task",
      description: "New Description",
      priority: "high",
    };

    test("トークンがない場合はエラーを返す", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("");

      const result = await createTask(mockTask);

      expect(result).toEqual({
        success: false,
        message: "No token",
      });
    });

    test("正常にタスクを作成できる", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
      });

      const result = await createTask(mockTask);

      expect(result).toEqual({
        success: true,
        status: 201,
        data: mockTask,
      });

      expect(mockFetch).toHaveBeenCalledWith("https://example.com/auth/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mock-token",
        },
        body: JSON.stringify({
          encryptedData: "encrypted-data",
        }),
      });
    });

    test("API呼び出しが失敗した場合はエラーを返す", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue("Bad Request"),
      });

      const result = await createTask(mockTask);

      expect(result).toEqual({
        success: false,
        message: "Bad Request",
        status: 400,
      });
    });

    test("ネットワークエラーの場合はエラーを返す", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await createTask(mockTask);

      expect(result).toEqual({
        success: false,
        message: "Network error",
      });
    });
  });

  describe("updateTask", () => {
    const mockTask: TaskData = {
      title: "Updated Task",
      description: "Updated Description",
      priority: "medium",
    };

    test("トークンがない場合はエラーを返す", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("");

      const result = await updateTask("1", mockTask);

      expect(result).toEqual({
        success: false,
        message: "No token",
      });
    });

    test("正常にタスクを更新できる", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await updateTask("1", mockTask);

      expect(result).toEqual({
        success: true,
        status: 200,
        data: mockTask,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.com/auth/tasks/1",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token",
          },
          body: JSON.stringify({
            encryptedData: "encrypted-data",
          }),
        },
      );
    });

    test("API呼び出しが失敗した場合はエラーを返す", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue("Not Found"),
      });

      const result = await updateTask("1", mockTask);

      expect(result).toEqual({
        success: false,
        message: "Not Found",
        status: 404,
      });
    });

    test("ネットワークエラーの場合はエラーを返す", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await updateTask("1", mockTask);

      expect(result).toEqual({
        success: false,
        message: "Network error",
      });
    });
  });

  describe("deleteTask", () => {
    test("トークンがない場合はエラーを返す", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("");

      const result = await deleteTask("1");

      expect(result).toEqual({
        success: false,
        message: "No token",
      });
    });

    test("正常にタスクを削除できる", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await deleteTask("1");

      expect(result).toEqual({
        success: true,
        status: 200,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.com/auth/tasks/1",
        {
          method: "DELETE",
          headers: { Authorization: "Bearer mock-token" },
        },
      );
    });

    test("API呼び出しが失敗した場合はエラーを返す", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue("Not Found"),
      });

      const result = await deleteTask("1");

      expect(result).toEqual({
        success: false,
        message: "Not Found",
        status: 404,
      });
    });

    test("ネットワークエラーの場合はエラーを返す", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await deleteTask("1");

      expect(result).toEqual({
        success: false,
        message: "Network error",
      });
    });

    test("文字列以外のエラーの場合は文字列に変換する", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      mockFetch.mockRejectedValue({ message: "Unknown error" });

      const result = await deleteTask("1");

      expect(result).toEqual({
        success: false,
        message: "[object Object]",
      });
    });
  });

  describe("Exception handling", () => {
    test("fetchTasks - Error以外の例外がthrowされた場合", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      // 文字列の例外をthrow
      mockFetch.mockRejectedValue("Network failure");

      const result = await fetchTasks();

      expect(result).toEqual({
        success: false,
        message: "Network failure",
      });
    });

    test("createTask - Error以外の例外がthrowされた場合", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      // 数値の例外をthrow
      mockFetch.mockRejectedValue(500);

      const taskData: TaskData = {
        title: "Test Task",
        description: "Test Description",
        priority: "medium",
      };

      const result = await createTask(taskData);

      expect(result).toEqual({
        success: false,
        message: "500",
      });
    });

    test("updateTask - Error以外の例外がthrowされた場合", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      // オブジェクトの例外をthrow
      mockFetch.mockRejectedValue({ error: "Server error" });

      const taskData: TaskData = {
        title: "Updated Task",
        description: "Updated Description",
        priority: "high",
      };

      const result = await updateTask("task-id", taskData);

      expect(result).toEqual({
        success: false,
        message: "[object Object]",
      });
    });

    test("deleteTask - Error以外の例外がthrowされた場合", async () => {
      const { getAccessToken } = await import("@/services/token");
      vi.mocked(getAccessToken).mockReturnValue("mock-token");

      // undefined の例外をthrow
      mockFetch.mockRejectedValue(undefined);

      const result = await deleteTask("task-id");

      expect(result).toEqual({
        success: false,
        message: "undefined",
      });
    });
  });
});
