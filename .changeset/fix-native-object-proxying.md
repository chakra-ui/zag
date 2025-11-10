---
"@zag-js/store": patch
---

Fix "Illegal invocation" errors by excluding native objects with special `this` bindings from being proxied.
