---
"@zag-js/steps": patch
"@zag-js/navigation-menu": patch
"@zag-js/drawer": patch
"@zag-js/tour": patch
---

Add `type="button"` to `getTriggerProps()` (steps, navigation-menu) and `getCloseTriggerProps()` (drawer, tour). Without
it these buttons defaulted to `type="submit"` and submitted an ancestor form on click.
