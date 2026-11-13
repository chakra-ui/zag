---
"@zag-js/navigation-menu": minor
---

- Add `data-activation-direction` to the viewport and content, and `api.activationDirection`.

- Fix a menu opened with `defaultValue` or an initial `value` not measuring its viewport or closing on Escape and
  outside click.

- Fix focus not returning to the trigger on Escape when the content unmounts synchronously.
