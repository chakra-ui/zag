---
"@zag-js/tags-input": patch
---

- Fix a regex `delimiter` not matching when typing if it has flags (e.g. `/\p{P}/u`, `/x/i`) or alternatives (e.g.
  `/,|;/` matched a comma anywhere in the input).
