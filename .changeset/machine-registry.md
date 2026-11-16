---
"@zag-js/core": minor
"@zag-js/react": patch
---

- Add `subscribeMachines` to `@zag-js/core`, which hears every machine that mounts or unmounts from then on, with its
  machine and latest service. Tools like an agent bridge or devtools can read and drive the machines on a page through
  it.
- React's `useMachine` now reports its machine to these listeners. It does nothing when no one is listening.
