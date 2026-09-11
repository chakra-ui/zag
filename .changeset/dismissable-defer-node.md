---
"@zag-js/dom-query": patch
"@zag-js/dismissable": patch
---

Fix popups dismissing themselves right after opening when their content is kept mounted while closed and re-parented on
open. The layer captured the element that was about to be detached, so interactions inside the live content counted as
outside clicks.

`defer: true` now always waits for the framework to commit, instead of resolving synchronously when an element happens
to already be there.
