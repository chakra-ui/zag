---
"@zag-js/accordion": patch
"@zag-js/angle-slider": patch
"@zag-js/avatar": patch
"@zag-js/carousel": patch
"@zag-js/cascade-select": patch
"@zag-js/checkbox": patch
"@zag-js/clipboard": patch
"@zag-js/collapsible": patch
"@zag-js/color-picker": patch
"@zag-js/combobox": patch
"@zag-js/date-input": patch
"@zag-js/date-picker": patch
"@zag-js/dialog": patch
"@zag-js/drawer": patch
"@zag-js/editable": patch
"@zag-js/file-upload": patch
"@zag-js/floating-panel": patch
"@zag-js/hover-card": patch
"@zag-js/image-cropper": patch
"@zag-js/listbox": patch
"@zag-js/marquee": patch
"@zag-js/menu": patch
"@zag-js/navigation-menu": patch
"@zag-js/number-input": patch
"@zag-js/pagination": patch
"@zag-js/password-input": patch
"@zag-js/pin-input": patch
"@zag-js/popover": patch
"@zag-js/progress": patch
"@zag-js/qr-code": patch
"@zag-js/radio-group": patch
"@zag-js/rating-group": patch
"@zag-js/scroll-area": patch
"@zag-js/select": patch
"@zag-js/signature-pad": patch
"@zag-js/slider": patch
"@zag-js/splitter": patch
"@zag-js/steps": patch
"@zag-js/switch": patch
"@zag-js/tabs": patch
"@zag-js/tags-input": patch
"@zag-js/timer": patch
"@zag-js/toast": patch
"@zag-js/toc": patch
"@zag-js/toggle-group": patch
"@zag-js/tooltip": patch
"@zag-js/tour": patch
"@zag-js/tree-view": patch
"@zag-js/types": patch
---

Write optional properties as explicit `?: T | undefined` instead of wrapping them in `Partial` from `@zag-js/types`.

That export shadowed the built-in `Partial`, which changed what `Partial<T>` meant in every file importing it and broke
`@vue/compiler-sfc` on `interface X extends Partial<Y>`. Types like `IntlTranslations` and `ElementIds` are now plain
interfaces. Passing a single translation key still works.
