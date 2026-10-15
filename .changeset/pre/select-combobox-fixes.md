---
"@zag-js/select": patch
"@zag-js/combobox": patch
---

**Select (`alignItemWithTrigger`):**

- The popup stays next to its trigger on Solid, Vue and Svelte.
- The popup grows to its content and respects `max-height`, instead of filling the space below the trigger.
- The popup no longer scrolls past the end of its list.
- When there isn't room to align, the selected item is still scrolled into view.
- Added `--reference-width`, so content can size itself to the trigger.

**Select:** Highlighting an item no longer throws when `translations` is omitted.

**Screen reader announcements (combobox and select):**

- Screen readers, VoiceOver in particular, no longer miss announcements.
- Announcements are cleared instead of staying in the accessibility tree, including when nothing is highlighted.
- A polite announcement can no longer inherit an assertive one.
