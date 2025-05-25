import { css } from "../../../styled-system/css";

const styles = {
  button: css({
    borderRadius: "0.25rem",
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  }),
  // Variants
  primary: css({
    backgroundColor: "#3b82f6",
    color: "white",
    "&:hover:not(:disabled)": {
      backgroundColor: "#2563eb",
    },
  }),
  secondary: css({
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    "&:hover:not(:disabled)": {
      backgroundColor: "#e5e7eb",
    },
  }),
  danger: css({
    backgroundColor: "#dc2626",
    color: "white",
    "&:hover:not(:disabled)": {
      backgroundColor: "#b91c1c",
    },
  }),
  // Sizes
  small: css({
    padding: "0.375rem 0.75rem",
    fontSize: "0.875rem",
  }),
  medium: css({
    padding: "0.5rem 1rem",
    fontSize: "1rem",
  }),
  large: css({
    padding: "0.75rem 1.5rem",
    fontSize: "1.125rem",
  }),
};

export default styles;
