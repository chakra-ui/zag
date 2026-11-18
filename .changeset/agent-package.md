---
"@zag-js/agent": minor
---

New package: lets an AI agent read and drive the Zag components on a page through three tools, `snapshot`, `query` and
`act`, instead of reading the accessibility tree and clicking. Supports accordion, checkbox, dialog, menu, select,
switch and tabs, plus plain fields and buttons. Includes `registerTools` for the browser's own agent (WebMCP), and the
`data-agent-confirm`, `data-agent-secret` and `data-agent-hidden` attributes for what needs a person. See the agent
tools guide.
