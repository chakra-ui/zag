---
"@zag-js/select": patch
---

Fixed issue where the selected item was not scrolled into view when the content falls back to standard positioning
(`alignItemWithTrigger` enabled but not enough space to align).

- The list only becomes scrollable once the positioner applies its `max-height`, which lands a frame or two after the
  content mounts. The initial scroll ran before that and was silently dropped, leaving the list at the top with the
  selected item out of view.
