---
"@zag-js/remove-scroll": patch
---

- Fixed issue where the scroll lock could apply to the wrong element (`<body>`) on layouts where `<html>` is the actual scroll container, silently doing nothing.
