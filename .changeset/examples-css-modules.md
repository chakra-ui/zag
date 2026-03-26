---
"@zag-js/shared": patch
"next-ts": patch
"nuxt-ts": patch
"preact-ts": patch
"solid-ts": patch
"svelte-ts": patch
"vanilla-ts": patch
---

Migrate shared example styles to CSS modules.

Converted `shared/src/style.css` and all `shared/src/css/*.css` files to `.module.css`, and updated example/starter imports to reference shared CSS modules directly.
