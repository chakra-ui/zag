---
"@zag-js/drawer": patch
---

- Fix controlled drawers snapping back to open before the close animation when dismissed via swipe.

- Fix indent and indent-background snapping back into place after the close animation instead of transitioning in sync.

- Fix `--drawer-swipe-progress` jumping to `1` at the start of a dismiss swipe; it now goes smoothly from `0` (at rest)
  to `1` (fully dismissed).

- Fix drawer freezing mid-drag on release when its content mounts lazily which left snap points unmeasured.
