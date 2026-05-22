---
"@zag-js/combobox": patch
---

Fix `Enter` no longer submits the form when an item is highlighted (regardless of `allowCustomValue`), or when the typed value will be rejected by `allowCustomValue: false`.
