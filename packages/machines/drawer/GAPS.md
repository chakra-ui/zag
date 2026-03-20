# Drawer — Missing Features

Gaps identified by comparing against Base UI's drawer implementation.

## P0 — Must Have

### ~~1. `description` anatomy part~~ ✅ Done

Added `description` to anatomy, `getDescriptionProps()` to API, conditional `aria-describedby`
on content element, and `rendered` context tracking (mirrors dialog pattern).

### 2. Change event `reason` field

Provide a `reason` string on `onOpenChange` so consumers know _why_ the drawer opened/closed.
Values: `trigger-press`, `outside-press`, `escape-key`, `close-press`, `swipe`, `programmatic`.

Without this, consumers can't distinguish a swipe dismiss from an escape key press,
making analytics and conditional close prevention difficult.

## P1 — Should Have

### ~~4. `SwipeArea` part (swipe-to-open)~~ ✅ Done

Added `swipeArea` anatomy part, `getSwipeAreaProps()` to API with `disabled` and `swipeDirection`
options, new `swiping-open` machine state with pointer tracking and size measurement,
`setSwipeOpenOffset`/`shouldOpen` on DragManager, rubber-band damping, velocity-based opening,
and controlled mode support.

### ~~5. Cross-axis scroll preservation~~ ✅ Done

Added cross-axis intent detection in `shouldStartDragging`. When movement is primarily
cross-axis and the target has scrollable content in that direction, drawer drag is suppressed.
Added cross-axis-scroll example to demonstrate.

### 6. `modal: "trap-focus"` hybrid mode

A third modal mode that traps focus but allows scroll and pointer interaction outside.
Use case: persistent side panels, non-blocking drawers that still manage focus for a11y.

## P2 — Nice to Have

### 7. Missing examples

Add examples for scenarios we support but don't demonstrate:
- ~~Non-modal drawer~~ ✅ Done
- ~~Side/position variants (left, right, top)~~ ✅ Done (non-modal uses right, mobile-nav uses bottom)
- ~~Action sheet pattern~~ ✅ Done
- ~~Mobile navigation~~ ✅ Done
- ~~Controlled open state~~ ✅ Done
