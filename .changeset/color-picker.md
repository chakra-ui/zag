---
"@zag-js/color-picker": minor
---

- Add `gamut` to keep the value inside sRGB or Display P3.

  ```ts
  gamut: "srgb" // or "p3"; false allows any color (default)
  ```

- Add `translations` for the accessible labels.

- Disable the eye dropper trigger, with `data-unsupported`, where the browser has no EyeDropper API.

- Keep a channel slider's thumb under the pointer while dragging, then settle on the value.

- Follow only the pointer that started a drag, and end drags when the window loses focus or a context menu opens.

- Fix the trigger's accessible name ignoring its own label, and the saturation input throwing for OKLab and OKLCH.

- Fix values losing precision and showing float noise.
