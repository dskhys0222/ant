import { css } from "../../../styled-system/css";

const styles = {
  taskList: css({
    display: "grid",
    gap: "1rem",
  }),
  taskCard: css({
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: "box-shadow 0.2s",
    "&:hover": {
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
  }),
  taskHeader: css({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  }),
  taskTitle: css({
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#1f2937",
    margin: 0,
    flex: 1,
  }),
  taskActions: css({
    display: "flex",
    gap: "0.5rem",
  }),
  taskDescription: css({
    color: "#6b7280",
    lineHeight: 1.5,
    margin: "0 0 1rem 0",
  }),
  taskMeta: css({
    display: "flex",
    gap: "1rem",
    fontSize: "0.875rem",
  }),
  dueDate: css({
    color: "#6b7280",
  }),
  priority: css({
    padding: "0.25rem 0.5rem",
    borderRadius: "0.25rem",
    fontWeight: 500,
    fontSize: "0.75rem",
  }),
  priorityHigh: css({
    backgroundColor: "#fef2f2",
    color: "#dc2626",
  }),
  priorityMedium: css({
    backgroundColor: "#fef3c7",
    color: "#d97706",
  }),
  priorityLow: css({
    backgroundColor: "#f0f9ff",
    color: "#0284c7",
  }),
  emptyState: css({
    textAlign: "center",
    padding: "3rem",
    color: "#6b7280",
    "& p": {
      margin: "0.5rem 0",
      "&:first-child": {
        fontSize: "1.125rem",
        fontWeight: 500,
      },
    },
  }),
};

export default styles;
