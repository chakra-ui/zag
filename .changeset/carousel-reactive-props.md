---
"@zag-js/carousel": patch
---

- Fix an issue where the carousel would not update when `slideCount` or `autoplay` props change.

- Fix an issue where `loop: false` was ignored when using autoplay. Now, the carousel will stop when it gets to the last
  slide.
