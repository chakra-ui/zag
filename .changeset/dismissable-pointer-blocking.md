---
"@zag-js/dismissable": patch
---

Allow `pointerBlocking` to be a getter, matching `exclude` and `persistentElements`. A layer's blocking can then change
without re-registering it, which would otherwise dismiss any nested layers and move the layer to the top of the stack.

Body blocking is now derived from the stack on both apply and restore. Call the new `syncPointerEvents` after a getter
changes value, since nothing was added or removed to trigger the usual sync.
