---
"@zag-js/react": patch
"@zag-js/preact": patch
---

- Fix a machine reading a stale value when several events arrive before the next render, so number-flow digits that
  animate out together are all removed at once.
