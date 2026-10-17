---
"@zag-js/combobox": patch
---

- Fix `inputBehavior: "autohighlight"` leaving no item highlighted when the collection changes after keyboard or pointer
  navigation and the highlighted item is removed. The first item is now highlighted, matching the behavior while typing.
