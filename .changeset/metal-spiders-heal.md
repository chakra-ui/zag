---
"@zag-js/react": patch
"@zag-js/preact": patch
---

Fix Fast Refresh lifecycle edge cases where machine cleanup could hydrate from stale state and skip expected effect
re-application.
