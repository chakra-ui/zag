---
"@zag-js/react": patch
"@zag-js/solid": patch
"@zag-js/preact": patch
"@zag-js/vue": patch
"@zag-js/svelte": patch
"@zag-js/vanilla": patch
---

Fix dialog, drawer, and popover leaving `<body>` uninteractive (`data-scroll-lock`, `data-inert`, `overflow: hidden`,
`pointer-events: none`) after closing under React 19 Strict Mode.
