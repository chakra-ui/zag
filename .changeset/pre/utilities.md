---
"@zag-js/hotkeys": patch
"@zag-js/collection": patch
---

**Hotkeys:** Export `getPlatform`, which resolves the current platform to `"mac" | "windows" | "linux"` for displaying
hotkeys, and the `SequenceStep` type.

**Collection:** `nodeToChildren` can return `undefined` or `null` for leaf nodes, so trees no longer need a `?? []`
workaround.
