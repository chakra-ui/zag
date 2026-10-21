---
"@zag-js/radio-group": patch
---

Sync the native checked state on all owned radio inputs, including disabled ones, when the controlled value changes.
Previously disabled inputs were skipped during synchronization, so re-enabling the group could submit a stale value.
