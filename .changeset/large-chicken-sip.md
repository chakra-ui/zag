---
"@zag-js/docs": patch
---

Fix ESM JSON imports for Node loader compatibility. Add `with { type: "json" }` import attributes and set build target
to `node20.10` so the ESM output works when loaded in next.config.mjs, velite, or other Node ESM contexts without
`ERR_IMPORT_ATTRIBUTE_MISSING`.
