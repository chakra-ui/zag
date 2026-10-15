---
"@zag-js/svelte": patch
---

Fix a machine missing a prop change made between its creation and its first effect run, for example a value an earlier
sibling's `$effect` writes on mount. `track` recorded its baseline on that first run, so the change was taken as the
starting value and the watch never fired. A presence machine created with `present: false` then never mounted, leaving
Ark UI's `Tabs.Content` hidden. The baseline is now taken when the machine is created, alongside its initial state.
