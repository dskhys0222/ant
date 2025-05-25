import { css } from "../../../styled-system/css";

const styles = {
  textBox: css({
    display: "block",
    width: "100%",
    padding: "0.5rem 0.75rem",
    fontSize: "1rem",
    lineHeight: 1.5,
    color: "var(--foreground)",
    backgroundColor: "var(--background)",
    border: "1px solid #ccc",
    borderRadius: "0.25rem",
    transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
    "&:focus": {
      outline: "none",
      borderColor: "var(--color-primary)",
      boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.25)",
    },
    "&::placeholder": {
      color: "#6b7280",
      opacity: 1,
    },
    "@media (prefers-color-scheme: dark)": {
      borderColor: "#4b5563",
      "&::placeholder": {
        color: "#9ca3af",
      },
    },
  }),
};

export default styles;
