---
"@zag-js/element-rect": minor
---

Add support for scoping the element rect tracking to size, position or rect.

```js
import { trackElementRect } from "@zag-js/element-rect"

trackElementRect(element, update, { scope: "size" }) // only track size
trackElementRect(element, update, { scope: "position" }) // only track position
trackElementRect(element, update, { scope: "rect" }) // track size and position (default)
```
