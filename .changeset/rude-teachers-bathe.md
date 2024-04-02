---
"@zag-js/menu": minor
---

Breaking: Refactor the anatomy

- Rename `getOptionItemIndicatorProps` to `getItemIndicatorProps`
- Rename `getOptionItemTextProps` to `getItemTextProps`

Changed `data-part` to match new anatomy:

- `data-part="option-item"` -> `data-part="item"`
- `data-part="option-item-indicator"` -> `data-part="item-indicator"`
- `data-part="option-item-text"` -> `data-part="item-text"`

To target the radio and checkbox items in your CSS, update your selectors accordingly.

```css
/* before */
[data-part="option-item"] {}

/* after */
[data-part="item"][data-type="radio|checkbox"] {}
```