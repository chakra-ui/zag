---
"@zag-js/slider": patch
---

Fix issue where range slider thumbs become stuck when dragged to the same position without `minStepsBetweenThumbs`. When
both thumbs are at max value, automatically select the movable thumb and add z-index to focused thumb for better visual
feedback.
