---
"@zag-js/utils": patch
---

Fix `isEqual` treating an object as equal to one with extra keys when the extra keys are on the first argument. `memo`
deps compared this way, so a progress instance whose `formatOptions` were a subset of the previous instance's reused
that instance's formatter.
