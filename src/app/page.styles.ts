import { css } from "../../styled-system/css";

const styles = {
  container: css({
    display: "grid",
    gridTemplateRows: "20px 1fr 20px",
    alignItems: "center",
    justifyItems: "center",
    minHeight: "100vh",
    padding: "2rem 2rem 5rem",
    gap: "4rem",
    "@media (min-width: 640px)": {
      padding: "5rem",
    },
  }),
  main: css({
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    gridRowStart: 2,
    alignItems: "center",
    "@media (min-width: 640px)": {
      alignItems: "flex-start",
    },
  }),
  title: css({
    fontSize: "1.25rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
  }),
};

export default styles;
