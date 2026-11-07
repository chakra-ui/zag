---
"@zag-js/number-flow": minor
"@zag-js/slider": minor
"@zag-js/infinite-scroll": patch
"@zag-js/tabs": patch
"@zag-js/toggle": patch
"@zag-js/anatomy-icons": patch
---

**Number flow:** Smoother transitions when the number gains or loses digits.

- Digits and symbols that enter or exit (e.g. `999` to `1,000`) now grow or shrink in place while fading, instead of
  popping in and out. New digits also roll in by one step.
- `transformTiming` now controls these enter and exit transitions. Previously it had no effect.
- The default timing for rolls and transitions is now a spring-like easing over `900ms`.
- Digits and symbols expose `data-entering` and `data-exiting` while they animate in or out.
- Reordering `formatOptions` keys no longer restarts the format update.

**Slider:** Allow `thumbSize` to be a single number that sets both the thumb width and height, e.g. `thumbSize: 20`.

**Infinite scroll:** Loading more now keeps working after the list is replaced (e.g. by a new search), and when the
sentinel renders after the machine starts observing.

**Tabs:** `onValueChange` and `onFocusChange` details are now typed as nullable. `value` is `null` after a
`deselectable` tab is deselected, and `focusedValue` is `null` when focus leaves the tab list.

**Toggle:** The machine now accepts the common `id` and `getRootNode` props, and `splitProps` keeps them.

**Anatomy icons:** Add missing anatomy diagrams for angle slider, cascade select, collapsible, drawer, image cropper,
listbox, marquee, navigation menu, and timer.
