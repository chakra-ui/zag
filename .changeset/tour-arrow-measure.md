---
"@zag-js/tour": patch
---

Fix a step's content jumping on open. The arrow was rendered with `hidden` and without its popper
styles until the content had been placed, so it measured `0` — and the offset middleware derives the
content's distance from the anchor from the arrow's `clientHeight`. The first placement landed half
an arrow too close to the target, then moved once something recomputed it. The arrow now carries its
styles from the first frame and is only kept out of sight until the content is placed, which is what
every other popper-backed machine already does.
