---
"@zag-js/dialog": minor
---

Add support for multiple triggers in Dialog component

- Add `triggerValue`, `defaultTriggerValue`, and `onTriggerValueChange` props to track which trigger opened the dialog
- Smart trigger switching: clicking a different trigger while dialog is open switches content without closing
