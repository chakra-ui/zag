---
"@zag-js/toast": patch
---

Fix issue where toasts collapse immediately when dismissing while hovering, by tracking pointer state and temporarily
ignoring spurious mouse events during DOM mutations using requestAnimationFrame.
