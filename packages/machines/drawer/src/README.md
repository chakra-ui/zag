# Drawer machine — how to read this package

## Start here

1. **`drawer.types.ts`** — `SwipeDirection`, snap point shapes, service/API types.
2. **`drawer.machine.ts`** — States (`open`, `closing`, `closed`, `swiping-open`, `swipe-area-dragging`), transitions,
   guards/actions, and **effects** (DOM subscriptions).
3. **`drawer.connect.ts`** — Props passed to the DOM (CSS vars, `data-*`, pointer handlers). Presentation math for
   translate/movement lives next to `getContentProps` / swipe area.

## Gesture & input (where bugs often land)

| Concern                                            | Where to look                                                                                                                           |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Pointer → machine events (`POINTER_MOVE`, etc.)    | `drawer.machine.ts` → effect **`trackPointerMove`** (document-level pointer + **touch**; touch `preventDefault` vs nested scroll).      |
| Swipe-open from closed (swipe area)                | Same file → **`trackSwipeOpenPointerMove`**; guard **`hasOpeningSwipeIntent`** uses **`utils/swipe.ts`**.                               |
| Drag thresholds, velocity, snap resolution         | **`utils/drag-manager.ts`**.                                                                                                            |
| Deferred mouse/pen “don’t arm drag on first pixel” | **`utils/deferred-pointer.ts`**; wired from **`drawer.connect.ts`** (`deferPointerDown` / `cancelDeferPointerDown`).                    |
| Scroll competition / nested scroller               | **`utils/get-scroll-info.ts`** (`findClosestScrollableAncestorOnSwipeAxis`, `shouldPreventTouchDefaultForDrawerPull`, `getScrollInfo`). |
| Ignore drag on inputs, selection, `data-no-drag`   | **`utils/is-drag-exempt-target.ts`** (`isDragExemptElement`, `shouldIgnorePointerDownForDrag`, `isTextSelectionInDrawer`).              |

## DOM & layout

- **`drawer.dom.ts`** — Part IDs, element getters, **`isPointerWithinContentOrSwipeArea`**.
- **`drawer.anatomy.ts`** — Part names/attributes for adapters.

## Stack / nested drawers

- **`drawer.stack.ts`**, **`drawer.registry.ts`** — Height and swipe progress for stacked sheets.

## Public entry

- **`index.ts`** re-exports machine, connect, props, types, stack helpers.

When fixing a regression, confirm whether it’s **event routing** (machine effects), **headless props** (connect), or
**pure gesture math** (utils) before editing.
