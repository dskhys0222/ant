import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from "@/services/task";
import type { TaskData, TaskDataWithId } from "@/services/task/types";
import { useCallback, useEffect, useState } from "react";

interface UseTasksReturn {
  tasks: TaskDataWithId[];
  loading: boolean;
  error: string | null;
  isFormOpen: boolean;
  editingTask: TaskDataWithId | null;
  openForm: (task?: TaskDataWithId) => void;
  closeForm: () => void;
  handleCreate: (task: TaskData) => Promise<void>;
  handleUpdate: (task: TaskData) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<TaskDataWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDataWithId | null>(null);

  const refreshTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await fetchTasks();
    if (result.success) {
      setTasks(result.data);
    } else {
      setError(result.message);
    }

    setLoading(false);
  }, []);

  const openForm = useCallback((task?: TaskDataWithId) => {
    setEditingTask(task || null);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingTask(null);
  }, []);

  const handleCreate = useCallback(
    async (task: TaskData) => {
      const result = await createTask(task);
      if (result.success) {
        await refreshTasks();
        closeForm();
      } else {
        setError(result.message);
      }
    },
    [refreshTasks, closeForm],
  );

  const handleUpdate = useCallback(
    async (task: TaskData) => {
      /* c8 ignore next */
      if (!editingTask) return;

      const result = await updateTask(editingTask._id, task);
      if (result.success) {
        await refreshTasks();
        closeForm();
      } else {
        setError(result.message);
      }
    },
    [editingTask, refreshTasks, closeForm],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("このタスクを削除しますか？")) return;

      const result = await deleteTask(id);
      if (result.success) {
        await refreshTasks();
      } else {
        setError(result.message);
      }
    },
    [refreshTasks],
  );

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  return {
    tasks,
    loading,
    error,
    isFormOpen,
    editingTask,
    openForm,
    closeForm,
    handleCreate,
    handleUpdate,
    handleDelete,
    refreshTasks,
  };
}

export default useTasks;
