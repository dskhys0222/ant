import type { TaskDataWithId } from "@/services/task/types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import TaskForm from "./index";

describe("TaskFormコンポーネント", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const mockTask: TaskDataWithId = {
    _id: "1",
    title: "既存のタスク",
    description: "既存の説明",
    dueDate: "2023-12-31",
    priority: "high",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("新規作成モードで正しくレンダリングされる", () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByText("新しいタスクを作成")).toBeInTheDocument();
    expect(screen.getByLabelText("タイトル")).toHaveValue("");
    expect(screen.getByLabelText("説明")).toHaveValue("");
    expect(screen.getByLabelText("期限")).toHaveValue("");
    expect(screen.getByLabelText("優先度")).toHaveValue("medium");
    expect(screen.getByText("作成")).toBeInTheDocument();
    expect(screen.getByText("キャンセル")).toBeInTheDocument();
  });

  test("編集モードで正しくレンダリングされる", () => {
    render(
      <TaskForm
        task={mockTask}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByText("タスクを編集")).toBeInTheDocument();
    expect(screen.getByLabelText("タイトル")).toHaveValue("既存のタスク");
    expect(screen.getByLabelText("説明")).toHaveValue("既存の説明");
    expect(screen.getByLabelText("期限")).toHaveValue("2023-12-31");
    expect(screen.getByLabelText("優先度")).toHaveValue("high");
    expect(screen.getByText("更新")).toBeInTheDocument();
  });

  test("フォームフィールドに値を入力できる", () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText("タイトル") as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(
      "説明",
    ) as HTMLTextAreaElement;
    const dueDateInput = screen.getByLabelText("期限") as HTMLInputElement;
    const prioritySelect = screen.getByLabelText("優先度") as HTMLSelectElement;

    fireEvent.change(titleInput, { target: { value: "新しいタスク" } });
    fireEvent.change(descriptionInput, { target: { value: "新しい説明" } });
    fireEvent.change(dueDateInput, { target: { value: "2024-01-01" } });
    fireEvent.change(prioritySelect, { target: { value: "low" } });

    expect(titleInput.value).toBe("新しいタスク");
    expect(descriptionInput.value).toBe("新しい説明");
    expect(dueDateInput.value).toBe("2024-01-01");
    expect(prioritySelect.value).toBe("low");
  });

  test("フォーム送信が正常に動作する", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText("タイトル");
    const descriptionInput = screen.getByLabelText("説明");
    const dueDateInput = screen.getByLabelText("期限");
    const prioritySelect = screen.getByLabelText("優先度");

    fireEvent.change(titleInput, { target: { value: "テストタスク" } });
    fireEvent.change(descriptionInput, { target: { value: "テスト説明" } });
    fireEvent.change(dueDateInput, { target: { value: "2024-01-01" } });
    fireEvent.change(prioritySelect, { target: { value: "high" } });

    const submitButton = screen.getByText("作成");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "テストタスク",
        description: "テスト説明",
        dueDate: "2024-01-01",
        priority: "high",
      });
    });
  });

  test("タイトルが空の場合は送信ボタンが無効になる", () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const submitButton = screen.getByText("作成");
    expect(submitButton).toBeDisabled();

    const titleInput = screen.getByLabelText("タイトル");
    fireEvent.change(titleInput, { target: { value: "タイトル" } });

    expect(submitButton).not.toBeDisabled();

    fireEvent.change(titleInput, { target: { value: "" } });
    expect(submitButton).toBeDisabled();
  });

  test("タイトルが空白のみの場合は送信されない", async () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const titleInput = screen.getByLabelText("タイトル");
    fireEvent.change(titleInput, { target: { value: "   " } });

    // フォーム要素を直接取得
    const form = titleInput.closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  test("送信中は送信ボタンが無効になり、ローディングテキストが表示される", async () => {
    mockOnSubmit.mockImplementation(() => new Promise(() => {})); // 永続的にpending

    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText("タイトル");
    fireEvent.change(titleInput, { target: { value: "テストタスク" } });

    const submitButton = screen.getByText("作成");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("保存中...")).toBeInTheDocument();
    });

    expect(submitButton).toBeDisabled();
    expect(screen.getByText("キャンセル")).toBeDisabled();
  });

  test("キャンセルボタンをクリックするとonCancelが呼ばれる", () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByText("キャンセル");
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test("説明が空の場合はundefinedで送信される", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText("タイトル");
    fireEvent.change(titleInput, { target: { value: "テストタスク" } });

    const submitButton = screen.getByText("作成");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "テストタスク",
        description: undefined,
        dueDate: undefined,
        priority: "medium",
      });
    });
  });

  test("期限が空の場合はundefinedで送信される", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText("タイトル");
    fireEvent.change(titleInput, { target: { value: "テストタスク" } });

    const dueDateInput = screen.getByLabelText("期限");
    fireEvent.change(dueDateInput, { target: { value: "" } });

    const submitButton = screen.getByText("作成");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "テストタスク",
        description: undefined,
        dueDate: undefined,
        priority: "medium",
      });
    });
  });

  test("タスクプロパティが変更されたときにフォームが更新される", () => {
    const { rerender } = render(
      <TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    expect(screen.getByLabelText("タイトル")).toHaveValue("");

    rerender(
      <TaskForm
        task={mockTask}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByLabelText("タイトル")).toHaveValue("既存のタスク");
    expect(screen.getByLabelText("説明")).toHaveValue("既存の説明");
    expect(screen.getByLabelText("期限")).toHaveValue("2023-12-31");
    expect(screen.getByLabelText("優先度")).toHaveValue("high");
  });

  test("説明が空白のみの場合はundefinedで送信される", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText("タイトル");
    const descriptionInput = screen.getByLabelText("説明");

    fireEvent.change(titleInput, { target: { value: "テストタスク" } });
    fireEvent.change(descriptionInput, { target: { value: "   " } });

    const submitButton = screen.getByText("作成");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "テストタスク",
        description: undefined,
        dueDate: undefined,
        priority: "medium",
      });
    });
  });

  test("フォーム要素に適切なaria属性とプレースホルダーが設定されている", () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText("タイトル");
    const descriptionInput = screen.getByLabelText("説明");

    expect(titleInput).toHaveAttribute("placeholder", "タスクのタイトルを入力");
    expect(titleInput).toHaveAttribute("required");
    expect(descriptionInput).toHaveAttribute(
      "placeholder",
      "タスクの説明を入力（任意）",
    );
  });
  test("タスクのプロパティがundefinedの場合のデフォルト値", () => {
    const taskWithUndefinedProps: TaskDataWithId = {
      _id: "1",
      title: "タスク",
      description: undefined,
      dueDate: undefined,
      priority: undefined,
    };

    render(
      <TaskForm
        task={taskWithUndefinedProps}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByLabelText("説明")).toHaveValue("");
    expect(screen.getByLabelText("期限")).toHaveValue("");
    expect(screen.getByLabelText("優先度")).toHaveValue("medium");
  });
  test("タスクのプロパティがnullの場合のデフォルト値", () => {
    const taskWithNullProps = {
      _id: "1",
      title: "タスク",
      description: null,
      dueDate: null,
      priority: null,
    } as unknown as TaskDataWithId;

    render(
      <TaskForm
        task={taskWithNullProps}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByLabelText("説明")).toHaveValue("");
    expect(screen.getByLabelText("期限")).toHaveValue("");
    expect(screen.getByLabelText("優先度")).toHaveValue("medium");
  });
});
