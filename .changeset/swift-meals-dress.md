---
"@zag-js/number-input": patch
---

Add additional `data-type` attribute to identify the spin buttons.

```css
[data-part="spin-button"] {
  /* shared styles for spin buttons */
}

[data-part="spin-button"][data-type="increment"] {
  /* styles for increment button */
}

[data-part="spin-button"][data-type="decrement"] {
  /* styles for decrement button */
}
```
