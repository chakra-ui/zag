---
"@zag-js/radio-group": patch
---

Fix missing `aria-labelledby` on radio hidden input, ensuring `getByRole('radio', { name: '...' })` works in testing
tools like Playwright.
