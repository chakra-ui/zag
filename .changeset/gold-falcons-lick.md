---
"@zag-js/svelte": patch
---

- Fix for style attribute ( now included in the use directive rather than the native spread )
- Fix for handlers not being updated correctly ( we used to attach them once the connect is init, but they need to be updated for each change of the api )
- Renamed attributes to attrs since lines are long enough
- Add Menu component example
