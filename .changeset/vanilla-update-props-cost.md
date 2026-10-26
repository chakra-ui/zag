---
"@zag-js/vanilla": patch
---

Fix growing update costs and stack overflows in `VanillaMachine.updateProps` by coalescing object patches and resolving
live getters without recursion.
