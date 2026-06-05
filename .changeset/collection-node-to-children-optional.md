---
"@zag-js/collection": patch
---

Allow `nodeToChildren` to return `undefined`/`null` for leaf nodes. The runtime already treats a missing result as
"no children", but the type required `any[]`, forcing a `?? []` workaround for trees with leaves (e.g. cascade-select).
