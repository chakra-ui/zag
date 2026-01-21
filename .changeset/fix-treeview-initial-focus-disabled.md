---
"@zag-js/tree-view": patch
"@zag-js/collection": patch
---

Fix initial focus issue when the first node or branch is disabled. Added `skip` option to `getFirstNode()` (matching
`getLastNode()`) to respect collapsed branches. The initial focus now correctly targets the first visible non-disabled
node.
