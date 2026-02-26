---
"@zag-js/utils": patch
---

Fix CJS build by configuring `esbuild-plugin-file-path-extensions` to use `.js` extension for CJS output instead of
`.cjs`, matching the actual output filenames from tsup.
