import { injectGlobal } from "@emotion/css"

injectGlobal({
  ":root": {
    "--ring-color": "blue",
  },
  "*": {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans",\n    "Helvetica Neue", sans-serif',
  },
  "*:focus": {
    outline: "2px dashed var(--ring-color)",
    outlineOffset: "2px",
  },
  ".root": { margin: "24px" },
  ".pre": {
    background: "rgba(0, 0, 0, 0.05)",
    padding: "20px",
    marginBottom: "40px",
    borderRadius: "10px",
    fontFamily: "monospace",
  },
})
