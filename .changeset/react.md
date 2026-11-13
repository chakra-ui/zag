---
"@zag-js/react": patch
---

- Fix a machine reading a stale value when several events arrive before the next render.

- Fix a machine starting after its component unmounted, which left effects like a dialog's scroll lock in place.
