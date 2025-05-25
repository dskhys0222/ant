import Button from "@/components/Button";
import TextField from "@/components/TextField";
import type { TaskData, TaskDataWithId } from "@/services/task/types";
import type React from "react";
import { useEffect, useState } from "react";
import styles from "./styles.module.css";

interface TaskFormProps {
  task?: TaskDataWithId | null;
  onSubmit: (task: TaskData) => Promise<void>;
  onCancel: () => void;
}

export default function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskData>({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate || "",
        priority: task.priority || "medium",
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const submitData: TaskData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        dueDate: formData.dueDate || undefined,
        priority: formData.priority,
      };
      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof TaskData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.title}>
            {task ? "タスクを編集" : "新しいタスクを作成"}
          </h2>

          <TextField
            label="タイトル"
            value={formData.title}
            onChange={handleChange("title")}
            required
            placeholder="タスクのタイトルを入力"
          />

          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>
              説明
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description")(e.target.value)}
              placeholder="タスクの説明を入力（任意）"
              className={styles.textarea}
              rows={4}
            />
          </div>

          <TextField
            label="期限"
            type="date"
            value={formData.dueDate || ""}
            onChange={handleChange("dueDate")}
          />

          <div className={styles.field}>
            <label htmlFor="priority" className={styles.label}>
              優先度
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleChange("priority")(e.target.value)}
              className={styles.select}
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>

          <div className={styles.actions}>
            <Button
              type="button"
              onClick={onCancel}
              variant="secondary"
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={!formData.title.trim() || isSubmitting}
            >
              {isSubmitting ? "保存中..." : task ? "更新" : "作成"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
