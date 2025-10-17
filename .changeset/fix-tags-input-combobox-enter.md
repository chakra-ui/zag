---
"@zag-js/tags-input": patch
---

Fix issue where entering a custom tag with combobox integration required pressing `Enter` twice.

The tags-input now correctly handles custom values when the combobox has no highlighted item (`aria-activedescendant` is
empty), allowing the tag to be added on the first `Enter` press.
