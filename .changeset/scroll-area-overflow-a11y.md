---
"@zag-js/scroll-area": patch
---

- Fix `hasOverflowX` and `hasOverflowY` starting as `true`, which flashed scrollbars before the content was measured.
- Fix wheeling over a scrollbar doing nothing once it remounts.
- Fix a viewport that overflows on one axis not being focusable.
- Fix `data-scrolling` being set for scrolls made in code, such as `scrollToEdge`.
- Fix a touch marking the scroll area as hovered.
- Fix pressing the scrollbar moving focus away from the viewport.
- Fix scroll snapping fighting a thumb drag.
- Fix a jump when dragging a thumb that fills its track.
- Hide the scrollbars and corner from assistive technology, and remove the viewport's presentational role.
- Clear the scrolling state 500ms after scrolling stops instead of 1000ms, and shrink the minimum thumb size to 16px.
