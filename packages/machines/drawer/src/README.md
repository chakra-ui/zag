# Drawer machine — how to read this package

## Start here

1. **`drawer.types.ts`** — `SwipeDirection`, snap point shapes, service/API types.
2. **`drawer.machine.ts`** — States (`open`, `closing`, `closed`, `swiping-open`, `swipe-area-dragging`), transitions,
   guards/actions, and **effects** (DOM subscriptions).
3. **`drawer.connect.ts`** — Props passed to the DOM (CSS vars, `data-*`, pointer handlers). Presentation math for
   translate/movement lives next to `getContentProps` / swipe area.

## Gesture & input (where bugs often land)

| Concern                                           | Where to look                                                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Generic swipe state and velocity tracking         | **`utils/session.ts`** (`SwipeSession`).                                                                |
| Drawer-specific swipe behavior and DOM bindings   | **`utils/drawer-session.ts`** (`DrawerSwipeSession`).                                                   |
| Swipe-open from closed (swipe area)               | `drawer.machine.ts` → **`trackSwipeOpenPointerMove`**; intent guard uses **`utils/drawer-session.ts`**. |
| Drag thresholds, offset math, snap/dismiss settle | **`utils/drawer-session.ts`**.                                                                          |
| Deferred mouse/pen content drag arming            | **`utils/session.ts`** pending-arm primitive, configured by **`utils/drawer-session.ts`**.              |
| Scroll competition / nested scroller              | **`utils/drawer-session.ts`**.                                                                          |
| Ignore drag on inputs, selection, `data-no-drag`  | **`utils/drawer-session.ts`**.                                                                          |

## DOM & layout

- **`drawer.dom.ts`** — Part IDs, element getters, **`isPointerWithinContentOrSwipeArea`**.
- **`drawer.anatomy.ts`** — Part names/attributes for adapters.

## Stack / nested drawers

- **`drawer.stack.ts`**, **`drawer.registry.ts`** — Height and swipe progress for stacked sheets.

## Public entry

- **`index.ts`** re-exports machine, connect, props, types, stack helpers.

When fixing a regression, confirm whether it’s **generic swipe state** (`utils/session.ts`), **drawer swipe behavior**
(`utils/drawer-session.ts`), or **headless props** (`drawer.connect.ts`) before editing.
