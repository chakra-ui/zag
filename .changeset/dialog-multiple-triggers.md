---
"@zag-js/dialog": minor
"@zag-js/hover-card": minor
"@zag-js/menu": minor
"@zag-js/popover": minor
"@zag-js/tooltip": minor
---

Add support for multiple triggers in overlay components

- Add `triggerValue`, `defaultTriggerValue`, and `onTriggerValueChange` props to track which trigger opened the component
- Smart trigger switching: interacting with a different trigger while component is open switches content without closing
- Affected components: Dialog, Hover Card, Menu (including Context Menu), Popover, Tooltip
