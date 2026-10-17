---
"@zag-js/react": patch
"@zag-js/preact": patch
---

- Fix controlled prop changes being missed when a component's effects reconnect, e.g. after a hidden `<Activity>` is
  shown again.
