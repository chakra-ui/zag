---
"@zag-js/tour": patch
---

Fix janky scroll behavior when navigating between tour steps. Changed `scrollIntoView` to use `block: "nearest"` instead of `block: "center"` so the page only scrolls when the target element is not already visible.
