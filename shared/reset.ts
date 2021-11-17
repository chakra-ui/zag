import { injectGlobal } from "@emotion/css"

injectGlobal`
:root {
  --ring-color: blue;
}

* {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans",
    "Helvetica Neue", sans-serif;
}

.root {
  margin: 24px;
}

.tabs {
  max-width: 20em;
}

[role="tablist"] {
  margin: 0 0 -0.1em;
  overflow: visible;
}

[role="tab"] {
  position: relative;
  margin: 0;
  padding: 0.3em 0.5em 0.4em;
  border: 1px solid hsl(219, 1%, 72%);
  border-radius: 0.2em 0.2em 0 0;
  box-shadow: 0 0 0.2em hsl(219, 1%, 72%);
  overflow: visible;
  font-size: inherit;
  background: hsl(220, 20%, 94%);
}

[role="tab"]:hover::before,
[role="tab"]:focus::before,
[role="tab"][aria-selected="true"]::before {
  position: absolute;
  bottom: 100%;
  right: -1px;
  left: -1px;
  border-radius: 0.2em 0.2em 0 0;
  border-top: 3px solid hsl(20, 96%, 48%);
  content: "";
}

[role="tab"][aria-selected="true"] {
  border-radius: 0;
  background: hsl(220, 43%, 99%);
  outline: 0;
}

[role="tab"][aria-selected="true"]:not(:focus):not(:hover)::before {
  border-top: 5px solid hsl(218, 96%, 48%);
}

[role="tab"][aria-selected="true"]::after {
  position: absolute;
  z-index: 3;
  bottom: -1px;
  right: 0;
  left: 0;
  height: 0.3em;
  background: hsl(220, 43%, 99%);
  box-shadow: none;
  content: "";
}

[role="tab"]:hover,
[role="tab"]:focus,
[role="tab"]:active {
  outline: 0;
  border-radius: 0;
  color: inherit;
}

[role="tab"]:hover::before,
[role="tab"]:focus::before {
  border-color: hsl(20, 96%, 48%);
}

[role="tabpanel"] {
  position: relative;
  z-index: 2;
  padding: 0.5em 0.5em 0.7em;
  border: 1px solid hsl(219, 1%, 72%);
  border-radius: 0 0.2em 0.2em 0.2em;
  box-shadow: 0 0 0.2em hsl(219, 1%, 72%);
  background: hsl(220, 43%, 99%);
}

[role="tabpanel"]:focus {
  border-color: hsl(20, 96%, 48%);
  box-shadow: 0 0 0.2em hsl(20, 96%, 48%);
  outline: 0;
}

[role="tabpanel"]:focus::after {
  position: absolute;
  bottom: 0;
  right: -1px;
  left: -1px;
  border-bottom: 3px solid hsl(20, 96%, 48%);
  border-radius: 0 0 0.2em 0.2em;
  content: "";
}

[role="tabpanel"] p {
  margin: 0;
}

[role="tabpanel"] * + p {
  margin-top: 1em;
}

.tabs__indicator {
  height: 4px;
  background-color: red;
  z-index: 10;
}

.pre {
  background: rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 40px;
  border-radius: 10px;
  font-family: monospace;
}

[data-tooltip] {
  z-index: 1;
  position: absolute;
  padding: 0.25em 0.5em;
  box-shadow: 2px 2px 10px hsla(0, 0%, 0%, 0.1);
  white-space: nowrap;
  font-size: 85%;
  background: #f0f0f0;
  color: #444;
  border: solid 1px #ccc;
}
`
