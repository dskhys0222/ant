import { css } from "../../styled-system/css";

const styles = {
  root: css({
    "& *": {
      boxSizing: "border-box",
    },
    "&": {
      "--background": "#ffffff",
      "--foreground": "#171717",
      "--font-sans":
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      "--font-mono":
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      "--color-primary": "#3b82f6",
      "--color-primary-hover": "#2563eb",
      "--color-primary-disabled": "#93c5fd",
    },
    "@media (prefers-color-scheme: dark)": {
      "--background": "#0a0a0a",
      "--foreground": "#ededed",
    },
  }),
  body: css({
    background: "var(--background)",
    color: "var(--foreground)",
    fontFamily: "var(--font-sans)",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
    "& *": {
      boxSizing: "border-box",
    },
    "& *::before": {
      boxSizing: "border-box",
    },
    "& *::after": {
      boxSizing: "border-box",
    },
  }),
};

export default styles;
