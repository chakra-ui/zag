---
"@zag-js/vanilla": patch
---

- Shrink the adapter by about a third and drop the `@zag-js/store` dependency.

- Publish once per tick instead of once per changed value.

- Keep one listener per event type in `spreadProps` instead of re-adding them on each render.
