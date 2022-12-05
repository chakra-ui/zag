---
"@zag-js/checkbox": patch
---

Use aria-readonly instead of readOnly attribute. `readonly` attribute only applies to text inputs, not checkboxes and
radios according to the [HTML spec](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly)
