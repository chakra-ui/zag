---
"@zag-js/auto-resize": patch
---

Fix issue where `autoresizeTextarea` breaks controlled textareas by re-dispatching an `input` event on
programmatic value changes, causing `onChange` to fire twice per keystroke and revert the controlled state.

The value setter override now wraps the framework's own value tracker (when present) instead of the prototype
descriptor, so programmatic writes stay in sync without synthesizing input events.
