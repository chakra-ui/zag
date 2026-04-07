---
"@zag-js/carousel": major
---

**Breaking:** Rename props for consistency with other machines.

### Migration

**`slideCount` → `count`** — Aligns with `rating`, `pagination`, etc.

```diff
- slideCount: items.length
+ count: items.length
```

**`autoplay` → `autoPlay`** — Consistent camelCase (matches HTML spec).

```diff
- autoplay: true
+ autoPlay: true

- autoplay: { delay: 2000 }
+ autoPlay: { delay: 2000 }
```

**`padding` → `itemSpacing`** — More descriptive name for the scroll padding around the viewport.

```diff
- padding: "16px"
+ itemSpacing: "16px"
```
