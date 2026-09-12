---
"@zag-js/dismissable": patch
---

Fix an open layer taking a second, unrelated layer down with it. Opening a select, popover or menu while another one was
open closed the first (as expected) and then immediately closed the one just opened. `layerStack` treated every layer
above a removed layer as nested in it, so two layers opened in sequence were indistinguishable from a dialog opened from
inside a dialog.

A layer now records the layer it is nested in when it is added: the one containing its node, or, for portalled content,
the one containing its trigger. Removing a layer only dismisses its own subtree, so layers opened side by side no longer
affect each other, while layers opened from within another layer still close with it.

An interaction inside a layer that is not nested in it now reaches that layer's `onInteractOutside` — previously any
layer higher on the stack counted as inside.
