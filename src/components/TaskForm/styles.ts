import { css } from "../../../styled-system/css";

const styles = {
  overlay: css({
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  }),
  modal: css({
    background: "white",
    borderRadius: "0.5rem",
    padding: "2rem",
    width: "100%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  }),
  form: css({
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  }),
  title: css({
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1f2937",
    margin: 0,
  }),
  field: css({
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  }),
  label: css({
    fontWeight: 500,
    color: "#374151",
    fontSize: "0.875rem",
  }),
  textarea: css({
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "1rem",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "100px",
    "&:focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  }),
  select: css({
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "1rem",
    backgroundColor: "white",
    cursor: "pointer",
    "&:focus": {
      outline: "none",
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    },
  }),
  actions: css({
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    marginTop: "1rem",
  }),
};

export default styles;
