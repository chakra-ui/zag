---
"@zag-js/carousel": patch
---

Fixed issue where `scrollToIndex` didn't scroll when the slide wasn't the first slide of a page, for example when
`slidesPerPage` is greater than 1.
