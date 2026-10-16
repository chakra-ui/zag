---
"@zag-js/react": patch
---

- Fix a controlled prop changed while the component is inside a hidden `<Activity>` being ignored once it is shown
  again, e.g. a collapsible opened while hidden staying closed.
