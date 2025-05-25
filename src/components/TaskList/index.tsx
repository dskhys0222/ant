import Button from "@/components/Button";
import type { TaskDataWithId } from "@/services/task/types";
import React from "react";
import styles from "./styles";

interface TaskListProps {
  tasks: TaskDataWithId[];
  onEdit: (task: TaskDataWithId) => void;
  onDelete: (id: string) => void;
}

export default function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>タスクがありません</p>
        <p>新しいタスクを作成してください</p>
      </div>
    );
  }

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case "high":
        return "高";
      case "medium":
        return "中";
      case "low":
        return "低";
      default:
        return "-";
    }
  };

  const getPriorityClass = (priority?: string) => {
    switch (priority) {
      case "high":
        return styles.priorityHigh;
      case "medium":
        return styles.priorityMedium;
      case "low":
        return styles.priorityLow;
      default:
        return "";
    }
  };

  return (
    <div className={styles.taskList}>
      {tasks.map((task) => (
        <div key={task._id} className={styles.taskCard}>
          <div className={styles.taskHeader}>
            <h3 className={styles.taskTitle}>{task.title}</h3>
            <div className={styles.taskActions}>
              <Button
                onClick={() => onEdit(task)}
                variant="secondary"
                size="small"
              >
                編集
              </Button>
              <Button
                onClick={() => onDelete(task._id)}
                variant="danger"
                size="small"
              >
                削除
              </Button>
            </div>
          </div>

          {task.description && (
            <p className={styles.taskDescription}>{task.description}</p>
          )}

          <div className={styles.taskMeta}>
            {task.dueDate && (
              <span className={styles.dueDate}>
                期限: {new Date(task.dueDate).toLocaleDateString("ja-JP")}
              </span>
            )}
            <span
              className={`${styles.priority} ${getPriorityClass(task.priority)}`}
            >
              優先度: {getPriorityLabel(task.priority)}
            </span>
          </div>
        </div>
      ))}{" "}
    </div>
  );
}
