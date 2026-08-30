---
"@zag-js/dismissable": patch
---

Track layer nesting by an explicit parent instead of stack position, so a re-registered layer keeps its place and cannot
claim unrelated layers as descendants.

- Fixed `getNestedLayers` treating every layer as nested inside an unregistered node.
- Cascade dismissal now runs shallowest first.

Add a `reattach` option to `remove`. It keeps the layer's identity and position for the next `add` and leaves its
descendants open, so a layer can be reconfigured without dismissing what is inside it.

Allow `pointerBlocking` to be a getter, matching `exclude` and `persistentElements`. Call the new `syncPointerEvents`
after its value changes.
