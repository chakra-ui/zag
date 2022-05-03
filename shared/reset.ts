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
  ".index-nav": {
    lineHeight: "1em",
    flex: "1",
    padding: "40px",
    ul: {
      listStyleType: "none",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gridGap: "20px",
      padding: "0",
      a: {
        display: "block",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        padding: "20px",
        textTransform: "capitalize",
        textDecoration: "none",
      },
    },
  },
  ".backlink": {
    margin: "16px 12px",
  },
})
