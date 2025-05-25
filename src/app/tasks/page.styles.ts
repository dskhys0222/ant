import { css } from "../../../styled-system/css";

const styles = {
  container: css({
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
  }),
  header: css({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  }),
  title: css({
    fontSize: "2rem",
    fontWeight: 600,
    color: "#1f2937",
    margin: 0,
  }),
  error: css({
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "1rem",
    borderRadius: "0.5rem",
    marginBottom: "1rem",
  }),
  loading: css({
    textAlign: "center",
    padding: "2rem",
    color: "#6b7280",
    fontSize: "1.1rem",
  }),
};

export default styles;
