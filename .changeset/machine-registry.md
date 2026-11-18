---
"@zag-js/core": minor
"@zag-js/react": patch
"@zag-js/preact": patch
"@zag-js/solid": patch
"@zag-js/svelte": patch
"@zag-js/vanilla": patch
"@zag-js/vue": patch
---

- Add `subscribeMachines` to `@zag-js/core`, which hears every machine that starts or stops from then on, with its
  machine and latest service. Tools like an agent bridge or devtools can read and drive the machines on a page through
  it.
- Every framework adapter now reports its machines to these listeners once they start, and again when they stop. It does
  nothing when no one is listening.
