---
"@zag-js/menubar": patch
---

Fixed issue where a trigger disabled with the native `disabled` attribute stayed in the arrow key and typeahead
rotation:

- Navigating onto it swallowed the keypress and left focus on the previous trigger.
- It could hold the roving `tabIndex=0`, taking the menubar out of the tab order.
