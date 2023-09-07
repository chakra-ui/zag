---
"@zag-js/form-utils": patch
"@zag-js/checkbox": patch
"@zag-js/switch": patch
---

- **Checkbox, Switch**: Dispatch change event when checked state is set programmatically to get it working in Solid.js
  form libraries
- **RadioGroup**: Fix issue where change event doesn't get dispatched when value changes
