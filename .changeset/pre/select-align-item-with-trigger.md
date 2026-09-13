---
"@zag-js/select": patch
---

Fixed issues with `alignItemWithTrigger` positioning.

- Fixed issue where the popup was positioned far from its trigger on Solid, Vue and Svelte, because the re-render after
  alignment reapplied the popper's own coordinates.
- Fixed issue where the popup grew to fill the space beneath the trigger rather than to its content, leaving an empty
  tail.
- Fixed issue where a `max-height` on the content was ignored while the popup grew, letting it expand to the viewport.
- Fixed issue where the popup scrolled past the end of the scroller.
- Added `--reference-width` while aligned, so content can size itself to the trigger.
