import * as taskService from "@/services/task";
import type { TaskDataWithId } from "@/services/task/types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import TasksPage from "./page";

// サービスをモック
vi.mock("@/services/task", () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

// コンポーネントをモック
vi.mock("@/components/TaskForm", () => ({
  default: ({
    task,
    onSubmit,
    onCancel,
  }: {
    task?: TaskDataWithId;
    onSubmit: (data: Record<string, unknown>) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="task-form">
      <span>タスクフォーム</span>
      {task && <span>編集モード: {task.title}</span>}
      <button
        type="button"
        onClick={() => onSubmit({ title: "新しいタスク", description: "説明" })}
      >
        送信
      </button>
      <button type="button" onClick={onCancel}>
        キャンセル
      </button>
    </div>
  ),
}));

vi.mock("@/components/TaskList", () => ({
  default: ({
    tasks,
    onEdit,
    onDelete,
  }: {
    tasks: TaskDataWithId[];
    onEdit: (task: TaskDataWithId) => void;
    onDelete: (id: string) => void;
  }) => (
    <div data-testid="task-list">
      {tasks.map((task: TaskDataWithId) => (
        <div key={task._id} data-testid={`task-${task._id}`}>
          <span>{task.title}</span>
          <button type="button" onClick={() => onEdit(task)}>
            編集
          </button>
          <button type="button" onClick={() => onDelete(task._id)}>
            削除
          </button>
        </div>
      ))}
    </div>
  ),
}));

// confirm をモック
global.confirm = vi.fn();

describe("TasksPageコンポーネント", () => {
  const mockTasks: TaskDataWithId[] = [
    {
      _id: "1",
      title: "タスク1",
      description: "説明1",
      priority: "high",
    },
    {
      _id: "2",
      title: "タスク2",
      description: "説明2",
      priority: "medium",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("ページタイトルと新規タスク作成ボタンが表示される", () => {
    const fetchTasksMock = vi.mocked(taskService.fetchTasks);
    fetchTasksMock.mockResolvedValue({
      success: true,
      data: [],
      status: 200,
    });

    render(<TasksPage />);

    expect(screen.getByText("タスク管理")).toBeInTheDocument();
    expect(screen.getByText("新規タスク作成")).toBeInTheDocument();
  });
  test("ローディング中は読み込み中メッセージを表示する", () => {
    const fetchTasksMock = vi.mocked(taskService.fetchTasks);
    fetchTasksMock.mockImplementation(() => new Promise(() => {})); // 永続的にpending

    render(<TasksPage />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  test("タスクリストが正常に表示される", async () => {
    const { fetchTasks } = await import("@/services/task");
    vi.mocked(fetchTasks).mockResolvedValue({
      success: true,
      data: mockTasks,
      status: 200,
    });

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByTestId("task-list")).toBeInTheDocument();
    });

    expect(screen.getByText("タスク1")).toBeInTheDocument();
    expect(screen.getByText("タスク2")).toBeInTheDocument();
  });

  test("エラーが発生した場合はエラーメッセージを表示する", async () => {
    const { fetchTasks } = await import("@/services/task");
    vi.mocked(fetchTasks).mockResolvedValue({
      success: false,
      message: "タスクの取得に失敗しました",
    });

    render(<TasksPage />);

    await waitFor(() => {
      expect(
        screen.getByText("エラー: タスクの取得に失敗しました"),
      ).toBeInTheDocument();
    });
  });

  test("新規タスク作成ボタンをクリックするとフォームが開く", async () => {
    const { fetchTasks } = await import("@/services/task");
    vi.mocked(fetchTasks).mockResolvedValue({
      success: true,
      data: [],
      status: 200,
    });

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument();
    });

    const createButton = screen.getByText("新規タスク作成");
    fireEvent.click(createButton);

    expect(screen.getByTestId("task-form")).toBeInTheDocument();
    expect(screen.getByText("タスクフォーム")).toBeInTheDocument();
  });

  test("タスクの編集ボタンをクリックするとフォームが編集モードで開く", async () => {
    const { fetchTasks } = await import("@/services/task");
    vi.mocked(fetchTasks).mockResolvedValue({
      success: true,
      data: mockTasks,
      status: 200,
    });

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByTestId("task-list")).toBeInTheDocument();
    });

    const editButton = screen.getAllByText("編集")[0];
    fireEvent.click(editButton);

    expect(screen.getByTestId("task-form")).toBeInTheDocument();
    expect(screen.getByText("編集モード: タスク1")).toBeInTheDocument();
  });

  test("タスクを正常に作成できる", async () => {
    const { fetchTasks, createTask } = await import("@/services/task");
    vi.mocked(fetchTasks).mockResolvedValue({
      success: true,
      data: [],
      status: 200,
    });
    vi.mocked(createTask).mockResolvedValue({
      success: true,
      data: { title: "新しいタスク", description: "説明" },
      status: 201,
    });

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument();
    });

    // フォームを開く
    const createButton = screen.getByText("新規タスク作成");
    fireEvent.click(createButton);

    // タスクを作成
    const submitButton = screen.getByText("送信");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith({
        title: "新しいタスク",
        description: "説明",
      });
    });

    // フォームが閉じられることを確認
    expect(screen.queryByTestId("task-form")).not.toBeInTheDocument();
  });

  test("タスクを正常に更新できる", async () => {
    const { fetchTasks, updateTask } = await import("@/services/task");
    vi.mocked(fetchTasks).mockResolvedValue({
      success: true,
      data: mockTasks,
      status: 200,
    });
    vi.mocked(updateTask).mockResolvedValue({
      success: true,
      status: 200,
      data: { title: "更新されたタスク", description: "更新された説明" },
    });

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByTestId("task-list")).toBeInTheDocument();
    });

    const editButton = screen.getAllByText("編集")[0];
    fireEvent.click(editButton);

    const submitButton = screen.getByText("送信");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledTimes(1);
    });
  });

  test("タスクを正常に削除できる", async () => {
    const { fetchTasks, deleteTask } = await import("@/services/task");
    vi.mocked(fetchTasks).mockResolvedValue({
      success: true,
      data: mockTasks,
      status: 200,
    });
    vi.mocked(deleteTask).mockResolvedValue({
      success: true,
      status: 200,
      data: undefined,
    });
    vi.mocked(global.confirm).mockReturnValue(true);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByTestId("task-list")).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByText("削除")[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteTask).toHaveBeenCalledWith("1");
    });

    expect(global.confirm).toHaveBeenCalledWith("このタスクを削除しますか？");
  });

  test("削除の確認でキャンセルした場合は削除されない", async () => {
    const { fetchTasks, deleteTask } = await import("@/services/task");
    vi.mocked(fetchTasks).mockResolvedValue({
      success: true,
      data: mockTasks,
      status: 200,
    });
    vi.mocked(global.confirm).mockReturnValue(false);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByTestId("task-list")).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByText("削除")[0];
    fireEvent.click(deleteButton);

    expect(deleteTask).not.toHaveBeenCalled();
  });

  test("フォームのキャンセルボタンでフォームが閉じる", async () => {
    const { fetchTasks } = await import("@/services/task");
    vi.mocked(fetchTasks).mockResolvedValue({
      success: true,
      data: [],
      status: 200,
    });

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument();
    });

    // フォームを開く
    const createButton = screen.getByText("新規タスク作成");
    fireEvent.click(createButton);

    expect(screen.getByTestId("task-form")).toBeInTheDocument();

    // キャンセル
    const cancelButton = screen.getByText("キャンセル");
    fireEvent.click(cancelButton);

    expect(screen.queryByTestId("task-form")).not.toBeInTheDocument();
  });

  test("タスク作成でエラーが発生した場合はエラーメッセージを表示する", async () => {
    const { fetchTasks, createTask } = await import("@/services/task");
    vi.mocked(fetchTasks).mockResolvedValue({
      success: true,
      data: [],
      status: 200,
    });
    vi.mocked(createTask).mockResolvedValue({
      success: false,
      message: "タスクの作成に失敗しました",
      status: 400,
    });

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument();
    });

    // フォームを開いてタスクを作成
    const createButton = screen.getByText("新規タスク作成");
    fireEvent.click(createButton);

    const submitButton = screen.getByText("送信");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("エラー: タスクの作成に失敗しました"),
      ).toBeInTheDocument();
    });
  });
  test("ローディング中は新規タスク作成ボタンが無効になる", () => {
    const fetchTasksMock = vi.mocked(taskService.fetchTasks);
    fetchTasksMock.mockImplementation(() => new Promise(() => {})); // 永続的にpending

    render(<TasksPage />);

    const createButton = screen.getByText("新規タスク作成");
    expect(createButton).toBeDisabled();
  });
  test("タスク作成でエラーが発生した場合", async () => {
    const fetchTasksMock = vi.mocked(taskService.fetchTasks);
    const createTaskMock = vi.mocked(taskService.createTask);

    fetchTasksMock.mockResolvedValue({
      success: true,
      data: [],
      status: 200,
    });

    createTaskMock.mockResolvedValue({
      success: false,
      message: "ネットワークエラー",
      status: 400,
    });

    render(<TasksPage />);

    // ローディングが完了するまで待つ
    await waitFor(() => {
      expect(screen.getByText("新規タスク作成")).not.toBeDisabled();
    });

    const createButton = screen.getByText("新規タスク作成");
    fireEvent.click(createButton);

    const submitButton = screen.getByText("送信");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("エラー: ネットワークエラー"),
      ).toBeInTheDocument();
    });
  });
  test("タスク更新でエラーが発生した場合", async () => {
    const tasks = [
      {
        _id: "1",
        title: "タスク1",
        description: "説明1",
        priority: "high" as const,
      },
    ];

    const fetchTasksMock = vi.mocked(taskService.fetchTasks);
    const updateTaskMock = vi.mocked(taskService.updateTask);

    fetchTasksMock.mockResolvedValue({
      success: true,
      data: tasks,
      status: 200,
    });

    updateTaskMock.mockResolvedValue({
      success: false,
      message: "ネットワークエラー",
    });

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByText("タスク1")).toBeInTheDocument();
    });

    const editButton = screen.getByText("編集");
    fireEvent.click(editButton);

    const submitButton = screen.getByText("送信");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("エラー: ネットワークエラー"),
      ).toBeInTheDocument();
    });
  });
  test("タスク削除でconfirmをキャンセルした場合", async () => {
    const tasks = [
      {
        _id: "1",
        title: "タスク1",
        description: "説明1",
        priority: "high" as const,
      },
    ];

    const fetchTasksMock = vi.mocked(taskService.fetchTasks);
    const deleteTaskMock = vi.mocked(taskService.deleteTask);

    fetchTasksMock.mockResolvedValue({
      success: true,
      data: tasks,
      status: 200,
    });

    // confirmをfalseに設定
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByText("タスク1")).toBeInTheDocument();
    });

    const deleteButton = screen.getByText("削除");
    fireEvent.click(deleteButton);

    // deleteTaskが呼ばれないことを確認
    expect(deleteTaskMock).not.toHaveBeenCalled();
  });

  test("タスク削除でエラーが発生した場合", async () => {
    const tasks = [
      {
        _id: "1",
        title: "タスク1",
        description: "説明1",
        priority: "high" as const,
      },
    ];

    const fetchTasksMock = vi.mocked(taskService.fetchTasks);
    const deleteTaskMock = vi.mocked(taskService.deleteTask);

    fetchTasksMock.mockResolvedValue({
      success: true,
      data: tasks,
      status: 200,
    });

    deleteTaskMock.mockResolvedValue({
      success: false,
      message: "ネットワークエラー",
    });

    // confirmをtrueに設定
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<TasksPage />);

    await waitFor(() => {
      expect(screen.getByText("タスク1")).toBeInTheDocument();
    });

    const deleteButton = screen.getByText("削除");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByText("エラー: ネットワークエラー"),
      ).toBeInTheDocument();
    });
  });
  test("editingTaskがnullの場合、handleUpdateは何もしない", async () => {
    const fetchTasksMock = vi.mocked(taskService.fetchTasks);
    const updateTaskMock = vi.mocked(taskService.updateTask);

    fetchTasksMock.mockResolvedValue({
      success: true,
      data: [],
      status: 200,
    });

    render(<TasksPage />);

    // ローディングが完了するまで待つ
    await waitFor(() => {
      expect(screen.getByText("新規タスク作成")).not.toBeDisabled();
    });

    // フォームを開く（新規作成）
    const createButton = screen.getByText("新規タスク作成");
    fireEvent.click(createButton);

    // 送信ボタンをクリック（この時editingTaskはnull）
    const submitButton = screen.getByText("送信");
    fireEvent.click(submitButton);

    // updateTaskが呼ばれないことを確認
    await waitFor(() => {
      expect(updateTaskMock).not.toHaveBeenCalled();
    });
  });
});
