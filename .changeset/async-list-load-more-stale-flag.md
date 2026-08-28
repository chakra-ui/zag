---
"@zag-js/async-list": patch
---

Fix `loadMore` requests being treated as initial loads. The load entry action read `isLoadingMore` from context before
it had settled, so the flag was always stale.
