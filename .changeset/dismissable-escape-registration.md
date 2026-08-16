---
"@zag-js/dom-query": patch
"@zag-js/dismissable": patch
---

Fix `Escape` being ignored right after a dismissable layer opens. `trackDismissableElement` deferred handler
registration to the next animation frame, so a dialog, popover or menu was painted and focus-trapped while its layer was
not yet on the stack. Under CPU load that gap grew well past one frame and swallowed the keypress. Handlers now register
as soon as the node commits.
