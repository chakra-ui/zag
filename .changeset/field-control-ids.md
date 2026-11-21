---
"@zag-js/field": patch
---

- Fix a control rendered without `item` taking the targeted item's id when `target` is set, which gave two controls the
  same id.
- Fix `ids.control` combined with `target` pointing the label at an id no control had. `ids.control` now names the
  targeted item's control.
