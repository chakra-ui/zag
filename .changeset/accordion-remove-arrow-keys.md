---
"@zag-js/accordion": minor
---

**Breaking:** Removed arrow, `Home`, and `End` key navigation between triggers and the `loopFocus` prop, following the
updated WAI-ARIA accordion pattern. Use `Tab` to move between triggers.

**Breaking:** `collapsible` now defaults to `true`, so an open item closes when clicked again. Set `collapsible: false`
to keep one item open.
