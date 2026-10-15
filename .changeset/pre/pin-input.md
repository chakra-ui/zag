---
"@zag-js/pin-input": major
---

- **Breaking:** `count` is now required. The machine no longer infers it from the DOM.

  ```diff
    pinInput.machine({
      id: "pin",
  +   count: 4,
    })
  ```

- Fixed issue where cut (`Ctrl/Meta+X`) was blocked outside React.
