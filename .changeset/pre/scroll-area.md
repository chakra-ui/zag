---
"@zag-js/scroll-area": patch
---

- Fix `hasOverflowX` and `hasOverflowY` starting as `true`, which flashed scrollbars before the content was measured.

- Fix wheeling over a remounted scrollbar doing nothing.

- Fix a viewport that overflows on one axis not being focusable, and pressing the scrollbar moving focus away from it.

- Fix `data-scrolling` being set for scrolls made in code, and a touch marking the area as hovered.

- Fix scroll snapping fighting a thumb drag, and a jump when dragging a thumb that fills its track.

- Hide the scrollbars and corner from assistive technology, and remove the viewport's presentational role.

- Clear the scrolling state 500ms after scrolling stops, and shrink the minimum thumb size to 16px.
