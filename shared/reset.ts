import { injectGlobal } from "@emotion/css"

injectGlobal`
:root {
  --ring-color: blue;
}

* {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans",
    "Helvetica Neue", sans-serif;
}

*:focus {
    outline: 2px dashed var(--ring-color);
    outline-offset: 2px;
}

.root {
  margin: 24px;
}

.pre {
  background: rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 40px;
  border-radius: 10px;
  font-family: monospace;
}
`
