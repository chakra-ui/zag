---
"@zag-js/tree-view": patch
---

- Fix `getNodeState` recomputing a node's state for every part of that node. It now computes once per node per render.
