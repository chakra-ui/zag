---
"@zag-js/signature-pad": patch
---

Fix controlled `paths` sync by keeping in-progress drawing in `onDraw.currentPath` instead of appending it to
`paths`.
