---
"@zag-js/hover-card": patch
---

Fixed issue where the hover card opened on focus that followed a pointer interaction, such as a dialog restoring focus
to the trigger. It now opens only for keyboard and assistive-technology focus, matching `@zag-js/tooltip`.
