---
"@zag-js/dismissable": patch
---

Fix issue where the escape key handler and layer registration were deferred by a frame when `defer: true`, leaving a just-opened dialog undismissable via the escape key until the next animation frame.

`trackDismissableElement` now resolves the node eagerly and registers handlers synchronously when the node is available. The deferred pass remains only as a fallback for nodes that have not rendered yet. Interact-outside behavior is unchanged, since it applies its own deferral internally.
