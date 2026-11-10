---
"@zag-js/dnd": minor
---

- Add `api.move({ value, to })` to move an item one step, or to the start or end, without dragging. It calls `onDrop`
  and announces the move.
- Add `isActivationKey` to choose the key that starts a keyboard drag, or return `false` to turn it off.
- Add `translations.roleDescription` to change the draggable's `aria-roledescription`, or `null` to keep the element's
  own role.

**Breaking:** Removed `dnd.move` and `dnd.getDestinationIndex`. Use `dnd.reorder`.

```diff
- dnd.move(items, fromIndex, dnd.getDestinationIndex(items.length, fromIndex, toIndex, placement))
+ dnd.reorder(items, { source, target, placement, itemToValue: (item) => item.id })
```
