---
"@zag-js/vanilla": patch
---

- Resolve props once until the props object changes, instead of on every `prop()` read. Props with getters still resolve
  on each read.
