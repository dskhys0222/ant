"use client";

import Button from "@/components/Button";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import React from "react";
import useTasks from "./page.hooks";
import styles from "./page.module.css";

export default function TasksPage() {
  const {
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
  } = useTasks();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>タスク管理</h1>
        <Button onClick={() => openForm()} disabled={loading}>
          新規タスク作成
        </Button>
      </header>
      {error && <div className={styles.error}>エラー: {error}</div>}
      {loading ? (
        <div className={styles.loading}>読み込み中...</div>
      ) : (
        <TaskList tasks={tasks} onEdit={openForm} onDelete={handleDelete} />
      )}
      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
