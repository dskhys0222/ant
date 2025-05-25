import type { TaskDataWithId } from "@/services/task/types";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import TaskList from "./index";

describe("TaskListコンポーネント", () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const mockTasks: TaskDataWithId[] = [
    {
      _id: "1",
      title: "高優先度タスク",
      description: "重要なタスクです",
      dueDate: "2023-12-31",
      priority: "high",
    },
    {
      _id: "2",
      title: "中優先度タスク",
      description: "普通のタスクです",
      dueDate: "2023-11-30",
      priority: "medium",
    },
    {
      _id: "3",
      title: "低優先度タスク",
      priority: "low",
    },
    {
      _id: "4",
      title: "優先度なしタスク",
      description: "説明のみのタスク",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("タスクがない場合は空の状態を表示する", () => {
    render(<TaskList tasks={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByText("タスクがありません")).toBeInTheDocument();
    expect(
      screen.getByText("新しいタスクを作成してください"),
    ).toBeInTheDocument();
  });

  test("タスクリストが正しく表示される", () => {
    render(
      <TaskList
        tasks={mockTasks}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("高優先度タスク")).toBeInTheDocument();
    expect(screen.getByText("中優先度タスク")).toBeInTheDocument();
    expect(screen.getByText("低優先度タスク")).toBeInTheDocument();
    expect(screen.getByText("優先度なしタスク")).toBeInTheDocument();
  });

  test("タスクの説明が正しく表示される", () => {
    render(
      <TaskList
        tasks={mockTasks}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("重要なタスクです")).toBeInTheDocument();
    expect(screen.getByText("普通のタスクです")).toBeInTheDocument();
    expect(screen.getByText("説明のみのタスク")).toBeInTheDocument();
  });

  test("期限が正しく表示される", () => {
    render(
      <TaskList
        tasks={mockTasks}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("期限: 2023/12/31")).toBeInTheDocument();
    expect(screen.getByText("期限: 2023/11/30")).toBeInTheDocument();
  });

  test("優先度が正しく表示される", () => {
    render(
      <TaskList
        tasks={mockTasks}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("優先度: 高")).toBeInTheDocument();
    expect(screen.getByText("優先度: 中")).toBeInTheDocument();
    expect(screen.getByText("優先度: 低")).toBeInTheDocument();
    expect(screen.getByText("優先度: -")).toBeInTheDocument();
  });

  test("編集ボタンをクリックするとonEditが呼ばれる", () => {
    render(
      <TaskList
        tasks={mockTasks}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const editButtons = screen.getAllByText("編集");
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTasks[0]);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  test("削除ボタンをクリックするとonDeleteが呼ばれる", () => {
    render(
      <TaskList
        tasks={mockTasks}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const deleteButtons = screen.getAllByText("削除");
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith("1");
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  test("複数のタスクの編集ボタンが個別に動作する", () => {
    render(
      <TaskList
        tasks={mockTasks}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const editButtons = screen.getAllByText("編集");

    fireEvent.click(editButtons[1]);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTasks[1]);

    fireEvent.click(editButtons[2]);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTasks[2]);

    expect(mockOnEdit).toHaveBeenCalledTimes(2);
  });

  test("複数のタスクの削除ボタンが個別に動作する", () => {
    render(
      <TaskList
        tasks={mockTasks}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const deleteButtons = screen.getAllByText("削除");

    fireEvent.click(deleteButtons[1]);
    expect(mockOnDelete).toHaveBeenCalledWith("2");

    fireEvent.click(deleteButtons[2]);
    expect(mockOnDelete).toHaveBeenCalledWith("3");

    expect(mockOnDelete).toHaveBeenCalledTimes(2);
  });

  test("説明がないタスクでは説明が表示されない", () => {
    const tasksWithoutDescription: TaskDataWithId[] = [
      {
        _id: "1",
        title: "説明なしタスク",
        priority: "medium",
      },
    ];

    render(
      <TaskList
        tasks={tasksWithoutDescription}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("説明なしタスク")).toBeInTheDocument();
    expect(screen.queryByText("説明")).not.toBeInTheDocument();
  });

  test("期限がないタスクでは期限が表示されない", () => {
    const tasksWithoutDueDate: TaskDataWithId[] = [
      {
        _id: "1",
        title: "期限なしタスク",
        priority: "medium",
      },
    ];

    render(
      <TaskList
        tasks={tasksWithoutDueDate}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("期限なしタスク")).toBeInTheDocument();
    expect(screen.queryByText(/期限:/)).not.toBeInTheDocument();
  });

  test("優先度がないタスクでは優先度に「-」が表示される", () => {
    const tasksWithoutPriority: TaskDataWithId[] = [
      {
        _id: "1",
        title: "優先度なしタスク",
        description: "優先度が設定されていません",
      },
    ];

    render(
      <TaskList
        tasks={tasksWithoutPriority}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("優先度: -")).toBeInTheDocument();
  });

  test("各タスクに正しいキーが設定されている", () => {
    const { container } = render(
      <TaskList
        tasks={mockTasks}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const taskCards = container.querySelectorAll('[class*="taskCard"]');
    expect(taskCards).toHaveLength(4);
  });

  test("優先度に応じた適切なCSSクラスが適用される", () => {
    render(
      <TaskList
        tasks={mockTasks}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const highPriorityElement = screen.getByText("優先度: 高").closest("span");
    const mediumPriorityElement = screen
      .getByText("優先度: 中")
      .closest("span");
    const lowPriorityElement = screen.getByText("優先度: 低").closest("span");

    // CSS Modulesのクラス名はハッシュ化されるため、元のクラス名をチェック
    expect(highPriorityElement?.className).toContain("_priority_");
    expect(highPriorityElement?.className).toContain("_priorityHigh_");
    expect(mediumPriorityElement?.className).toContain("_priority_");
    expect(mediumPriorityElement?.className).toContain("_priorityMedium_");
    expect(lowPriorityElement?.className).toContain("_priority_");
    expect(lowPriorityElement?.className).toContain("_priorityLow_");
  });

  test("日付が正しい形式で表示される", () => {
    const taskWithSpecificDate: TaskDataWithId[] = [
      {
        _id: "1",
        title: "特定日付のタスク",
        dueDate: "2023-01-15",
        priority: "medium",
      },
    ];

    render(
      <TaskList
        tasks={taskWithSpecificDate}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("期限: 2023/1/15")).toBeInTheDocument();
  });
});
