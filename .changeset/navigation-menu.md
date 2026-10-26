---
"@zag-js/navigation-menu": patch
---

- Fix a pending open or close timer changing the value after the navigation menu unmounts.
- Fix hovering the same trigger again leaving an earlier open timer running.
- Fix Escape not closing the content right after it opens.
