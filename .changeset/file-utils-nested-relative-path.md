---
"@zag-js/file-utils": patch
---

Fix `getFileEntries` dropping the `/` between nested directory names in `relativePath` (e.g. `photos/2024/b.png`).
