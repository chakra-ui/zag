---
"@zag-js/dom-query": patch
"@zag-js/checkbox": patch
"@zag-js/switch": patch
"@zag-js/tags-input": patch
---

- Fix controls not reflecting a disabled ancestor `<fieldset>` that isn't the closest one.
- Fix checkbox, switch and tags-input ignoring a disabled `<fieldset>` in `data-disabled` and the API.
