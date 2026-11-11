---
"@zag-js/vanilla": patch
---

- Shrink the adapter by about a third and drop the `@zag-js/store` dependency.
- Fix a machine publishing once per changed value. It now publishes once per tick.
- Keep one event listener per event type in `spreadProps`, instead of re-adding every listener on each render.
