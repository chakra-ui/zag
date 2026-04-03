---
"@zag-js/combobox": patch
---

Fix VoiceOver not announcing combobox options when navigating with arrow keys. Safari/VoiceOver ignores
`aria-activedescendant` changes on combobox inputs, so we now use a live region to announce the highlighted item on
Apple devices.
