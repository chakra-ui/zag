---
"@zag-js/accordion": patch
---

Fix missing `data-focus` attribute on `getItemTriggerProps`. This makes the trigger consistent with the other accordion
parts (`getItemProps`, `getItemContentProps`, `getItemIndicatorProps`) which already expose `data-focus`.
