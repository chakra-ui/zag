---
"@zag-js/number-input": minor
---

- Refactor number input machine to handle number parsing correctly
- Fix issue where value doesn't listen to form reset events
- **BREAKING:** Removed the following context properties in favor of the new `formatOptions`: `validateCharacter`,
  `parse`, `format`, `minFractionDigits`, `maxFractionDigits`
