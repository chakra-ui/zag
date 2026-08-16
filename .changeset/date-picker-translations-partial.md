---
"@zag-js/date-picker": patch
---

Fix the `translations` prop requiring every message to be supplied. It's now typed as `Partial<IntlTranslations>`, so
you can override a single message and let the rest fall back to the defaults.
