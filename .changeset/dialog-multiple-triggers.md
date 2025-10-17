---
"@zag-js/dialog": minor
---

Add support for multiple triggers in Dialog component

- Add `activeTriggerValue`, `defaultActiveTriggerValue`, and `onActiveTriggerChange` props to track which trigger opened the dialog
- Update `getTriggerProps` to accept optional `TriggerProps` parameter with `value` property
- Add `data-ownedby`, `data-value`, and `data-current` data attributes to trigger elements
- Support function form for `ids.trigger` to generate custom IDs for multiple triggers: `ids.trigger = (value) => value ? \`dialog-\${value}\` : 'dialog-trigger'`
- Update dismiss behavior to exclude all triggers from outside click detection
- Smart trigger switching: clicking a different trigger while dialog is open switches content without closing
- Improved focus restoration: automatically restores focus to the active trigger element when dialog closes
- Fully backward compatible - existing code continues to work without changes
