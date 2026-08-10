---
"@zag-js/number-input": patch
---

- Fixed issue where a cancelled pointer left the value stepping on its own. A hold interrupted by touch scrolling or a
  re-render never ended, and the repeat interval kept running.
- Fixed issue where holding a stepper on touch could raise the context menu and interrupt the repeat.
