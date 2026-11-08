---
"@zag-js/tags-input": patch
---

Fix pasting with `addOnPaste` skipping the checks that typing a tag goes through. Each pasted tag is now validated on
its own, empty segments are skipped, and the paste stops at `max` unless `allowOverflow` is set.
