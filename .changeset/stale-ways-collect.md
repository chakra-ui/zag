---
"@zag-js/color-picker": patch
---

Fix issue where entering empty value in alpha sets value to `NaN`. Now, it reverts back to the previous alpha value.
