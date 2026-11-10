---
"@zag-js/toc": patch
---

- Fix the active heading ignoring `rootMargin` and `threshold` changes made after mount.
- Fix headings and a `scrollEl` that mount after the TOC never being tracked. The TOC picks them up on the next scroll.
