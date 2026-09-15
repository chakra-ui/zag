---
"@zag-js/tour": patch
---

Fix a step staying anchored to its original element after that element is replaced. The target was
resolved once, when the step opened, so a layout that swaps the node while the tour is running — a
sticky header moving its buttons into a portal, a responsive branch — left the machine pointing at a
detached node. A detached node measures zero, which collapses the step's card, its spotlight and the
backdrop's cut-out into the top-left corner of the page. The target is now resolved on every
position update.
