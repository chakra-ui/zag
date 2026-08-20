---
"@zag-js/hotkeys": patch
---

Export `getPlatform`, which resolves the current platform to `"mac" | "windows" | "linux"`, useful when formatting
hotkeys for display. Also export the `SequenceStep` type, the element type of `ParsedHotkey.sequenceSteps`.
