---
"@zag-js/progress": patch
---

Fix issue where using a smaller `max` than `50` throws due to the fact the default `value` is set to `50`.

Now we set the default `value` to mid value between the `min` and `max`
