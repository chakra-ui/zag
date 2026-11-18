---
"@zag-js/agent": minor
---

New package: lets an AI agent read and drive the Zag components on a page through three tools, `snapshot`, `query` and
`act`, instead of reading the accessibility tree and clicking. Describes 41 components, from form inputs like combobox,
date picker, slider and tags input to popups like popover and drawer, plus plain fields and buttons. Includes
`registerTools` for the browser's own agent (WebMCP), and the `data-agent-confirm`, `data-agent-secret` and
`data-agent-hidden` attributes for what needs a person. See the agent tools guide for every component and its actions.
