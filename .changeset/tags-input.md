---
"@zag-js/tags-input": patch
---

- Fix characters typed right after a delimiter being cleared along with the new tag's text.
- Fix the edit input's auto-resize leaking when editing ends right after it starts.
- Fix a tag staying highlighted after pressing Escape right after deleting the first tag, so a later Delete removed it.
- Fix focus jumping back to the input when focus moves away right after editing a tag.
- Fix a paste with `addOnPaste` adding tags and calling `onValueChange` after the component unmounts.
