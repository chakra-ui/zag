---
"@zag-js/steps": patch
"@zag-js/navigation-menu": patch
"@zag-js/drawer": patch
---

Add `type="button"` to `getTriggerProps()` (steps, navigation-menu) and `getCloseTriggerProps()` (drawer). Without it, these buttons defaulted to `type="submit"` and submitted an ancestor form on click.
