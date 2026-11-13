---
"@zag-js/toc": major
---

- **Breaking:** Default `multiple` to `false`, so only the topmost visible heading is active.

  ```diff
  - toc.machine({})
  + toc.machine({ multiple: true })
  ```

- Fix the active heading ignoring `rootMargin` and `threshold` changes after mount.

- Fix headings and `scrollEl` that mount after the TOC not being tracked.
