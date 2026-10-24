---
"@zag-js/steps": patch
---

- Fix `aria-current="step"` being set on the item wrapper inside the `tablist`. It is now set on the current step's
  trigger (`role="tab"`), so assistive technology gets it on the focusable tab and the list no longer fails axe's
  `aria-required-children` rule.
