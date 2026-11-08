---
"@zag-js/rating-group": patch
---

- Fix the first pointer move onto a rating item not previewing that item. The preview now shows as soon as the pointer
  lands on an item, instead of on the next move.
- Fix a touch move over a focused rating group leaving a preview behind that the next tap would commit.
