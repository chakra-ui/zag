---
"next-ts": patch
"nuxt-ts": patch
"preact-ts": patch
"solid-ts": patch
"svelte-ts": patch
"vanilla-ts": patch
---

Migrate example apps to import shared styles through CSS modules.

All example entry points now reference `examples/shared/styles/style.module.css`, and vanilla's index now loads styles via a module entry file.
