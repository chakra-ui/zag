---
"@zag-js/svelte": patch
---

Refactor `mergeProps` to return the class values as an array, this delegates the resolution to Svelte's native class
handling, which uses `clsx` internally.

> This ensures proper support for conditional classes, arrays, and objects
