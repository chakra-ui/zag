---
"@zag-js/vanilla": patch
---

- Fix machines resolving their props on every `prop()` read. Props now resolve once until the props object changes;
  props with getters still resolve on each read.
