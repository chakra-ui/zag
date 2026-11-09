---
"@zag-js/dismissable": patch
---

- Fix a layer opening while its would-be parent is closing being dismissed with it, which closed the next menubar menu
  in Vue after ArrowRight on a submenu item.
