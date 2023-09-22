---
"@zag-js/menu": minor
---

- Add new `optionItemIndicator` and `optionItemText` part
- Add `api.optionItemIndicatorProps(...)`, `api.optionItemTextProps(...)` support
- Add `api.getOptionItemState` and `api.getItemState`
- Export `OptionItemState` and `ItemState` types

> Breaking changes

- Removed `api.isOptionChecked` in favor of `api.getOptionItemState`
