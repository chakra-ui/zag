---
"@zag-js/slider": minor
---

- Add `scale` for log and custom scales. `"log"` gives each ratio the same length, for volume, frequency or zoom.

  ```ts
  scale: "log" // needs a positive min
  scale: { to: Math.sqrt, from: (position) => position ** 2 } // your own curve
  ```

- Fix `Home` and `End` landing off the step grid when `max - min` isn't a multiple of `step`.

- Follow only the pointer that started a drag, and end drags when the window loses focus or a context menu opens.
