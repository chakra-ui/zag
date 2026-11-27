---
"@zag-js/angle-slider": patch
"@zag-js/carousel": patch
"@zag-js/color-picker": patch
"@zag-js/dnd": patch
"@zag-js/floating-panel": patch
"@zag-js/image-cropper": patch
"@zag-js/scheduler": patch
"@zag-js/scroll-area": patch
"@zag-js/signature-pad": patch
"@zag-js/slider": patch
"@zag-js/splitter": patch
---

- Follow only the pointer that started a drag, so a second finger no longer moves it.
- End drags when the window loses focus or a context menu opens.
- Undo a cancelled drag in dnd, the scheduler, the floating panel and the image cropper instead of committing it.
- Restore the image cropper's crop or pan on Escape.
- Fix arrow keys moving the image cropper selection and the floating panel the wrong way in RTL.
- Fix a click on the floating panel's title bar nudging the panel.
- Fix the scheduler dropping the last pointer move before a drop.
- Draw every coalesced point in the signature pad.
