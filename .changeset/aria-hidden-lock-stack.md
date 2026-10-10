---
"@zag-js/aria-hidden": patch
---

- Fixed issue where an open nested dialog, drawer, or modal popover was hidden from screen readers when its portal was
  in the DOM before the parent opened (Solid's `Portal`, or content mounted while closed).
- Fixed issue where a menu, select, or other popup opened from inside a modal was hidden from screen readers when its
  portal was in the DOM before the modal opened.
