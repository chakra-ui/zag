---
"@zag-js/dialog": patch
---

Fix issue where dialog positioner applied the `hidden` attribute when closed leading to pre-mature exit of css
animations applied to the dialog content.

> Only the backdrop and content should use the `hidden` attribute.
