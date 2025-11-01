---
"@zag-js/marquee": patch
---

- Fix Firefox flicker when marquee animation loops
- Use margin-based spacing instead of gap for items
- Use `backface-visibility: hidden` for better GPU acceleration
- Add new `item` part with `getItemProps()` method
